const responser = require('express-responser');
const RequestFactory = require('logged-request-promise');
const isNil = require('lodash/isNil');
const urlSelector = require('url-selector');
const CustomError = require('custom-service-error');
const ipShield = require('ip-shield');
const CryptoJS = require('crypto-js');

function UnauthorizedError() {
  this.name = 'UnauthorizedError';
  this.message = 'Unauthorized';
  this.status = 401;
  this.code = 400005001;
  CustomError.call(this);
}

UnauthorizedError.prototype = CustomError.prototype;
module.exports.UnauthorizedError = UnauthorizedError;

function ValidationError(meta) {
  this.name = 'ValidationError';
  this.message = 'ValidationError';
  this.status = 406;
  this.code = 400008001;
  this.meta = meta.array ? meta.array() : meta || {};
  CustomError.call(this);
}

ValidationError.prototype = CustomError.prototype;
module.exports.ValidationError = ValidationError;

module.exports = (config) => {
  return {
    verifyClient: (req, res, next) => {
      if (isNil(config.endpoints.clientServiceUrl)) {
        throw new Error('express-authenticator validate: Invalid appStart parameters: config.endpoints.clientServiceUrl is null or undefined');
      }
      const request = RequestFactory.init(req.serviceInit);
      const { headers } = req;
      if (!headers.client_key || !headers.client_secret || !headers.organization_id) {
        return responser.withError(next, new UnauthorizedError());
      }

      if (!ipShield(config.authorizedSubnets, req.ip)) {
        return responser.withError(next, new UnauthorizedError());
      }
      const options = {
        uri: config.endpoints.clientServiceUrl,
        method: 'post',
        crossedUrl: false,
        json: true,
        isClientAuthenticated: true
      };

      request(options)
        .then((body) => {
          req.currentClient = {
            clientName: body.data.clientName,
            clientKey: body.data.clientKey,
            id: body.data.id,
            organizationId: headers.organization_id
          };
          req.serviceInit.currentClient = req.currentClient;
          return next();
        })
        .catch((err) => {
          return responser.withError(next, err);
        });
    },
    verifyToken: (req, res, next) => {
      if (isNil(config.endpoints.authServiceUrl)) {
        throw new Error('express-authenticator validate: Invalid appStart parameters: config.endpoints.authServiceUrl is null or undefined');
      }
      const request = RequestFactory.init(req.serviceInit);
      if (!req.headers.authorization) {
        return responser.withError(next, new UnauthorizedError());
      }
      if (config.cross && !config.cross.allowMultipleOrganization && req.headers.cross && req.headers.cross === '*') {
        return responser.withError(next, new UnauthorizedError());
      }

      if (config.cross && config.cross.allowMultipleOrganization && req.headers.cross && req.headers.cross === '*') {
        if (!urlSelector.isMatch(config.cross.multipleOrganizationEndpoints || [], req, config.cross.topicPrefix, true)) {
          return responser.withError(next, new UnauthorizedError());
        }
      }

      const options = {
        uri: config.endpoints.authServiceUrl,
        method: 'post',
        isAuthenticated: true,
        json: true,
        crossedUrl: false
      };

      request(options)
        .then((body) => {
          req.currentUser = {
            userId: body.data.userId,
            username: body.data.username,
            clientId: body.data.clientId,
            organizationId: body.data.organizationId,
            type: body.data.type,
            firstName: body.data.firstName,
            lastName: body.data.lastName,
            avatar: body.data.avatar,
            departmentId: body.data.departmentId,
            roleId: body.data.roleId
          };

          if (body.data.crossOrganization) {
            req.currentUser.crossOrganization = body.data.crossOrganization;
            if (body.data.crossOrganization.status === 'Inactive') {
              if (
                config.cross
                && !config.cross.allowMultipleOrganization
                && config.cross.InactiveWhiteListTopic
                && config.cross.InactiveWhiteListTopic.length > 0
                && urlSelector.isMatch(config.cross.InactiveWhiteListTopic, req, config.cross.topicPrefix, true)
              ) {
                return next();
              }
              return responser.withError(next, new UnauthorizedError());
            }
          }
          return next();
        })
        .catch((err) => {
          return responser.withError(next, err);
        });
    },
    verifyPublicKey: (req, res, next) => {
      if (isNil(config.auth) || isNil(config.auth.publicKey)) {
        throw new Error('express-authenticator validate: Invalid appStart parameters: config.auth.publicKey is null or undefined');
      }
      req.checkBody({
        hash: {
          notEmpty: true,
          errorMessage: 'Invalid hash identifier'
        },
        pin: {
          notEmpty: true,
          errorMessage: 'Invalid pin identifier'
        }
      });
      req.getValidationResult()
        .then((result) => {
          if (!result.isEmpty()) {
            throw (result);
          }
          const errorObject = {
            location: 'body',
            param: 'hash',
            msg: 'Invalid hash identifier'
          };
          try {
            const pin = CryptoJS
              .AES
              .decrypt(req.body.hash, config.auth.publicKey)
              .toString(CryptoJS.enc.Utf8);
            if (req.body.pin !== pin) {
              throw errorObject;
            }
          } catch (error) {
            throw errorObject;
          }
          return next();
        })
        .catch((err) => {
          return responser.withError(next, new ValidationError(err));
        });
    },
    verifyExternalClient: (req, res, next) => {
      if (isNil(config.endpoints.clientServiceUrl)) {
        throw new Error('express-authenticator validate: Invalid appStart parameters: config.endpoints.externalClientServiceUrl is null or undefined');
      }
      const request = RequestFactory.init(req.serviceInit);
      const { headers } = req;
      if (!headers.client_key || !headers.client_secret) {
        return responser.withError(next, new UnauthorizedError());
      }

      const options = {
        uri: config.endpoints.externalClientServiceUrl,
        method: 'post',
        crossedUrl: false,
        json: true,
        isClientAuthenticated: true
      };

      request(options)
        .then((body) => {
          req.currentClient = {
            clientName: body.data.clientName,
            clientKey: body.data.clientKey,
            id: body.data.id,
            details: body.data.ClientDetails,
            token: body.data.token,
            user: body.data.user
          };
          req.serviceInit.currentClient = req.currentClient;
          if (!ipShield(body.data.clientIp, req.ip)) {
            return responser.withError(next, new UnauthorizedError());
          }
          return next();
        })
        .catch((err) => {
          return responser.withError(next, err);
        });
    }
  };
};
