'use strict';

module.exports = function (options) {
    let url = options.url;
    let parameter = options.params;
    let query = options.query;
    let params;
    let parts;
    let index;
    let paramsIsArray;
    let key;

    if (parameter) {
        parts = url.split('/');
        index = 0;
        paramsIsArray = Array.isArray(parameter);
        parts = parts.map(function (part) {
            if (part[0] === ':') {
                let value = ((paramsIsArray) ? parameter[index++] : parameter[part.slice(1)]);
                return value ? encodeURIComponent(value) : part;
            }

            return part;
        });

        url = parts.join('/');
    }

    if (query) {
        parts = [];
        for (key in query) {
            parts.push(key + '=' + encodeURIComponent(query[key]));
        }

        url += '?' + parts.join('&');
    }

    return url;
};