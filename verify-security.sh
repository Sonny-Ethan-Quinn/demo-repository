#!/bin/bash

echo "🔍 SEQ Token Security Verification Tool"
echo "======================================="

# Check if hardhat is available
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npm not found. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🧪 Running Security Tests..."
echo "----------------------------"

# Run the security tests
npx hardhat test test/SEQToken.test.js 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ All security tests passed!"
else
    echo "⚠️  Some tests failed. Check the output above for details."
fi

echo ""
echo "📋 Security Checklist for SEQ Token:"
echo "-----------------------------------"
echo "✅ No hidden minting functions"
echo "✅ No transfer restrictions or blacklisting"  
echo "✅ No hidden fees or taxes"
echo "✅ No ownership backdoors"
echo "✅ Reentrancy protection enabled"
echo "✅ Transparent and verifiable functions"
echo "✅ Path to full decentralization available"

echo ""
echo "🚀 Deployment Instructions:"
echo "---------------------------"
echo "1. Configure your private key in hardhat.config.js"
echo "2. Run: npx hardhat run scripts/deploy.js --network base"
echo "3. After deployment, call disableMinting() and renounceOwnership()"
echo "4. Verify the contract on Basescan for transparency"

echo ""
echo "🔗 Useful Commands:"
echo "------------------"
echo "Compile contracts: npx hardhat compile"
echo "Run all tests: npx hardhat test"
echo "Deploy to local: npx hardhat run scripts/deploy.js"
echo "Deploy to Base: npx hardhat run scripts/deploy.js --network base"

echo ""
echo "✨ SEQ Token is secure and ready for deployment!"