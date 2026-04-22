"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const analysis_service_1 = require("./services/analysis.service");
const metricsAdvanced_service_1 = require("./services/metricsAdvanced.service");
const prisma = new client_1.PrismaClient();
const sampleJavaScriptCode = `
// E-commerce checkout module
const express = require('express');
var router = express.Router();
var db = require('./database');

// TODO: Add input validation before release
function processPayment(cardNumber, amount, userId) {
  var query = "SELECT * FROM users WHERE id = " + userId;
  
  // FIXME: This is not secure
  eval(req.body.promo_code);
  
  if (cardNumber == null) {
    console.log("Card number is missing");
    return false;
  }
  
  try {
    var result = db.execute(query);
  } catch(e) {}
  
  if (amount == 0) {
    console.log("Zero amount detected");
  }
  
  alert("Processing payment...");
  
  const data = result.user.account.wallet.balance.available.amount;
  debugger;
  
  return result;
}

// TODO: Refactor this function
router.post('/checkout', function(req, res) {
  var cartItems: any = req.body.items;
  var total: any = 0;
  
  for (var i = 0; i < cartItems.length; i++) {
    var item = cartItems[i];
    total = total + item.price;
  }
  
  const payment = processPayment(req.body.card, total, req.body.userId);
  
  if (payment == true) {
    res.json({ success: true });
  }
});
`;
const samplePythonCode = `
import os
import sys
import json
import pickle

# FIXME: Security review needed
password = "super_secret_password_123"
api_key = "sk-abcdef123456"

def get_user_data(user_id):
    # SQL injection vulnerability
    query = f"SELECT * FROM users WHERE id = {user_id}"
    
    try:
        result = db.execute(query)
        return result
    except:
        pass

def process_request(data):
    # Dangerous eval usage
    result = eval(data['expression'])
    
    # Mutable default argument
    def process_items(items=[]):
        items.append("new_item")
        return items
    
    # Comparison to None with ==
    if result == None:
        print("Result is None")
        return None
    
    return result

# TODO: Add proper error handling
def load_config(config_path):
    with open(config_path, 'r') as f:
        # Unsafe deserialization
        config = pickle.load(f)
    return config

def calculate_total(prices, discount=0, tax=0.0, currency="USD", round_to=2, include_shipping=True):
    total = sum(prices) * (1 - discount) * (1 + tax)
    print(f"Total: {total}")  # Should use logging
    return round(total, round_to)
`;
const sampleJavaCode = `
package com.example.shop;

import java.sql.*;
import java.io.*;

public class UserService {
    
    // Hardcoded credentials - VULNERABILITY
    private static final String DB_PASSWORD = "admin123";
    private static final String SECRET_KEY = "mysecretkey";
    
    public User findUser(String userId) {
        // SQL Injection vulnerability
        String query = "SELECT * FROM users WHERE id = " + userId;
        
        Connection conn = new Connection(DB_URL);
        Statement stmt = new Statement();
        
        try {
            ResultSet rs = stmt.executeQuery(query);
            return mapUser(rs);
        } catch(Exception e) {}
        
        return null;
    }
    
    public boolean validateEmail(String email) {
        // String comparison with ==
        if (email == "admin@example.com") {
            return true;
        }
        
        // TODO: Add proper email validation regex
        System.out.println("Validating email: " + email);
        return email.contains("@");
    }
    
    public void processOrders(List<Order> orders, int maxRetries, int batchSize, 
                               String currency, boolean async, String callbackUrl) {
        for (Order order : orders) {
            // Magic numbers
            if (order.getAmount() > 9999) {
                System.err.println("Large order detected: " + order.getId());
            }
            
            // Unclosed resource
            FileOutputStream fos = new FileOutputStream("order_" + order.getId() + ".log");
        }
    }
    
    // FIXME: This method is too complex
    public String formatReport(User user) {
        String report = "User Report\\n";
        report += "Name: " + user.getName() + "\\n"; // HACK: fix string concatenation
        
        // Null comparison with equals
        if (user.getEmail().equals(null)) {
            return "Invalid user";
        }
        
        return report;
    }
}
`;
async function seed() {
    console.log('🌱 Starting database seed...\n');
    // Clean existing data
    await prisma.issue.deleteMany();
    await prisma.metric.deleteMany();
    await prisma.analysis.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    // Create default user
    const user = await prisma.user.create({
        data: {
            email: 'demo@codescam.dev',
            password: '$2a$10$demo', // Not a real hash, just for demo
            name: 'Demo User',
            role: 'ANALYST'
        }
    });
    console.log('✅ Created demo user\n');
    // Create projects
    const jsProject = await prisma.project.create({
        data: { name: 'E-commerce Frontend', language: 'javascript', userId: user.id }
    });
    const pyProject = await prisma.project.create({
        data: { name: 'Data Processing API', language: 'python', userId: user.id }
    });
    const javaProject = await prisma.project.create({
        data: { name: 'Backend Microservice', language: 'java', userId: user.id }
    });
    const cleanProject = await prisma.project.create({
        data: { name: 'Auth Service v2', language: 'typescript', userId: user.id }
    });
    console.log('✅ Created 4 projects\n');
    // Run analyses
    console.log('🔍 Running JS analysis...');
    const jsAnalysis = await prisma.analysis.create({
        data: { projectId: jsProject.id, status: 'PENDING' }
    });
    await (0, analysis_service_1.runAnalysis)(jsAnalysis.id, sampleJavaScriptCode, 'src/checkout.js');
    // Generate advanced metrics
    await metricsAdvanced_service_1.metricsAdvancedService.assignSecurityMappings(jsAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.generateTestResults(jsAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.generateFileComplexity(jsAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.createSecurityHotspots(jsAnalysis.id);
    const jsMetrics = await prisma.metric.findFirst({ where: { analysisId: jsAnalysis.id } });
    if (jsMetrics) {
        await metricsAdvanced_service_1.metricsAdvancedService.updateMetricsWithAdvanced(jsAnalysis.id);
        await metricsAdvanced_service_1.metricsAdvancedService.recordMetricsEvolution(jsMetrics.id);
    }
    await metricsAdvanced_service_1.metricsAdvancedService.recordQualityGateHistory(jsProject.id, 'FAILED', 'Too many critical issues');
    console.log('🔍 Running Python analysis...');
    const pyAnalysis = await prisma.analysis.create({
        data: { projectId: pyProject.id, status: 'PENDING' }
    });
    await (0, analysis_service_1.runAnalysis)(pyAnalysis.id, samplePythonCode, 'api/user_service.py');
    await metricsAdvanced_service_1.metricsAdvancedService.assignSecurityMappings(pyAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.generateTestResults(pyAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.generateFileComplexity(pyAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.createSecurityHotspots(pyAnalysis.id);
    const pyMetrics = await prisma.metric.findFirst({ where: { analysisId: pyAnalysis.id } });
    if (pyMetrics) {
        await metricsAdvanced_service_1.metricsAdvancedService.updateMetricsWithAdvanced(pyAnalysis.id);
        await metricsAdvanced_service_1.metricsAdvancedService.recordMetricsEvolution(pyMetrics.id);
    }
    await metricsAdvanced_service_1.metricsAdvancedService.recordQualityGateHistory(pyProject.id, 'FAILED', 'Security vulnerabilities detected');
    console.log('🔍 Running Java analysis...');
    const javaAnalysis = await prisma.analysis.create({
        data: { projectId: javaProject.id, status: 'PENDING' }
    });
    await (0, analysis_service_1.runAnalysis)(javaAnalysis.id, sampleJavaCode, 'src/UserService.java');
    await metricsAdvanced_service_1.metricsAdvancedService.assignSecurityMappings(javaAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.generateTestResults(javaAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.generateFileComplexity(javaAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.createSecurityHotspots(javaAnalysis.id);
    const javaMetrics = await prisma.metric.findFirst({ where: { analysisId: javaAnalysis.id } });
    if (javaMetrics) {
        await metricsAdvanced_service_1.metricsAdvancedService.updateMetricsWithAdvanced(javaAnalysis.id);
        await metricsAdvanced_service_1.metricsAdvancedService.recordMetricsEvolution(javaMetrics.id);
    }
    await metricsAdvanced_service_1.metricsAdvancedService.recordQualityGateHistory(javaProject.id, 'FAILED', 'Code complexity too high');
    // Clean TypeScript project - minimal issues
    const cleanCode = `
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    return true;
  } catch {
    return false;
  }
}

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  // TODO: implement database lookup
  return res.status(200).json({ message: 'Login endpoint' });
});

export default router;
  `;
    console.log('🔍 Running TypeScript analysis...');
    const cleanAnalysis = await prisma.analysis.create({
        data: { projectId: cleanProject.id, status: 'PENDING' }
    });
    await (0, analysis_service_1.runAnalysis)(cleanAnalysis.id, cleanCode, 'src/auth.ts');
    await metricsAdvanced_service_1.metricsAdvancedService.assignSecurityMappings(cleanAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.generateTestResults(cleanAnalysis.id);
    await metricsAdvanced_service_1.metricsAdvancedService.generateFileComplexity(cleanAnalysis.id);
    const cleanMetrics = await prisma.metric.findFirst({ where: { analysisId: cleanAnalysis.id } });
    if (cleanMetrics) {
        await metricsAdvanced_service_1.metricsAdvancedService.updateMetricsWithAdvanced(cleanAnalysis.id);
        await metricsAdvanced_service_1.metricsAdvancedService.recordMetricsEvolution(cleanMetrics.id);
    }
    await metricsAdvanced_service_1.metricsAdvancedService.recordQualityGateHistory(cleanProject.id, 'PASSED', 'All quality gates met');
    // Verify results
    const totalIssues = await prisma.issue.count();
    const totalAnalyses = await prisma.analysis.count();
    console.log(`\n✅ Seed complete!`);
    console.log(`   📦 Projects: 4`);
    console.log(`   🔬 Analyses: ${totalAnalyses}`);
    console.log(`   🐛 Issues: ${totalIssues}`);
    console.log(`\n🚀 Dashboard ready at http://localhost:3000`);
}
seed()
    .catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map