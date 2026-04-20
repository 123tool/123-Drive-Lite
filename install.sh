#!/bin/bash

echo "------------------------------------------"
echo "  INSTALLING 123 DRIVE LITE BY 123TOOL   "
echo "------------------------------------------"

# Update & Install Nodejs
pkg update && pkg upgrade -y
pkg install nodejs -y

# Minta Izin Storage
termux-setup-storage

# Install Dependencies
npm install

echo ""
echo "------------------------------------------"
echo "  INSTALL SELESAI !               "
echo "  Ketik: node server.js                  "
echo "  Lalu buka: http://localhost:8080       "
echo "------------------------------------------"
