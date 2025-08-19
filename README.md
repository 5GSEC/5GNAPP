# 5GNAPP

**5G-native management platform**

5GNAPP is a comprehensive platform for managing 5G networks, featuring network monitoring, security analysis, and xApp orchestration capabilities.

## 🚀 Features

- **5G Network Management**: Comprehensive network monitoring and control
- **Security Analysis**: Integrated with MobiLLM for intelligent threat detection
- **xApp Orchestration**: Build, deploy, and manage network applications
- **Real-time Monitoring**: Live network telemetry and event processing
- **Web Dashboard**: React-based user interface for network operations

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Docker (for xApp deployment)
- Kubernetes cluster (optional, for production)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/5GSEC/5GNAPP.git
cd 5GNAPP
```

### 2. Initialize MobiLLM Submodule

```bash
# Initialize and update the MobiLLM submodule
git submodule update --init --recursive

# Verify MobiLLM is properly linked
ls server/MobiLLM/
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

```bash
cd server
pip install -r requirements.txt
cd ..
```

### 5. Set Environment Variables

```bash
# Edit the set_env.sh file with your configuration
nano set_env.sh

# Make the script executable and run it
chmod +x set_env.sh
source set_env.sh
```

**Note**: The `set_env.sh` file contains template environment variables. Edit it with your actual values before running.

## 🚀 Running the Application

Using the Start Script (Linux/macOS)

```bash
# Make the script executable
chmod +x start.sh

# Run the application
./start.sh
```


## 🌐 Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## 📁 Project Structure

```
5GNAPP/
├── src/                 # React frontend source code
├── server/              # Python backend server
│   ├── MobiLLM/        # MobiLLM submodule (AI security)
│   ├── server.py       # Main server file
│   └── requirements.txt # Python dependencies
├── xApp/               # xApp deployment directory
├── package.json        # Node.js dependencies
├── start.sh           # Startup script
└── README.md          # This file
```

