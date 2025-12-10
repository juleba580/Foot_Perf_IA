# Football Performance with Artificial Intelligence  (Foot Perf AI)

A modern, dockerized web application for football player performance prediction using machine learning and AI.

## Features

- **Player Performance Prediction** - ML-powered performance scoring
- **Batch Analysis** - Process multiple players via CSV upload
- **AI Recommendations** - Personalized training advice using Gemini AI
- **Modern Authentication** - JWT-based auth with Google OAuth
- **Dockerized** - Easy deployment with Docker Compose
- **React Frontend** - Modern, responsive user interface
- **Microservices Architecture** - Separate auth and prediction APIs

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google OAuth credentials (for social login)
- Gemini AI API key (for recommendations)

### Installation

1. **Clone and initialize**
```bash
git clone <repository>
cd Foot_Perf_IA
chmod +x init-models.sh
./init-models.sh