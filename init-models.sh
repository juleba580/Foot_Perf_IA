#!/bin/bash

echo "Initializing UQACsss Models..."

# Create shared models directory
mkdir -p shared/models
mkdir -p shared/data

# Copy existing models from your original project structure
echo "Copying model files..."
cp -r "Performance_Prediction/models/"* shared/models/ 2>/dev/null || echo "Models directory not found, please copy manually"
cp -r "Performance_Prediction/pipelines/"* shared/models/ 2>/dev/null || echo "Pipelines directory not found, please copy manually"

# Create attribute thresholds file if it doesn't exist
if [ ! -f "shared/data/attribute_thresholds.json" ]; then
    echo "Creating default attribute thresholds..."
    cat > shared/data/attribute_thresholds.json << 'EOF'
{
  "crossing": {"seuil": 65, "image": "/images/crossing.jpg", "recommendation": "Practice crossing accuracy from different positions"},
  "finishing": {"seuil": 70, "image": "/images/finishing.jpg", "recommendation": "Work on shooting techniques and accuracy"},
  "heading_accuracy": {"seuil": 60, "image": "/images/heading.jpg", "recommendation": "Improve heading technique and timing"},
  "short_passing": {"seuil": 70, "image": "/images/passing.jpg", "recommendation": "Focus on pass accuracy and weight"},
  "volleys": {"seuil": 55, "image": "/images/volley.jpg", "recommendation": "Practice volley techniques from various angles"},
  "dribbling": {"seuil": 75, "image": "/images/dribbling.jpg", "recommendation": "Work on close control and 1v1 situations"},
  "curve": {"seuil": 50, "image": "/images/curve.jpg", "recommendation": "Practice bending shots and passes"},
  "free_kick_accuracy": {"seuil": 60, "image": "/images/freekick.jpg", "recommendation": "Develop free-kick techniques"},
  "long_passing": {"seuil": 65, "image": "/images/longpass.jpg", "recommendation": "Work on long-range passing accuracy"},
  "ball_control": {"seuil": 75, "image": "/images/ballcontrol.jpg", "recommendation": "Improve first touch and control"},
  "acceleration": {"seuil": 80, "image": "/images/acceleration.jpg", "recommendation": "Focus on explosive starts and quick bursts"},
  "sprint_speed": {"seuil": 80, "image": "/images/speed.jpg", "recommendation": "Work on maximum speed development"},
  "agility": {"seuil": 75, "image": "/images/agility.jpg", "recommendation": "Practice quick direction changes"},
  "reactions": {"seuil": 70, "image": "/images/reactions.jpg", "recommendation": "Improve response time to game situations"},
  "balance": {"seuil": 70, "image": "/images/balance.jpg", "recommendation": "Work on core strength and stability"},
  "shot_power": {"seuil": 65, "image": "/images/shotpower.jpg", "recommendation": "Develop shooting power and technique"},
  "jumping": {"seuil": 65, "image": "/images/jumping.jpg", "recommendation": "Improve vertical leap and timing"},
  "stamina": {"seuil": 75, "image": "/images/stamina.jpg", "recommendation": "Build endurance through interval training"},
  "strength": {"seuil": 70, "image": "/images/strength.jpg", "recommendation": "Develop physical strength for duels"},
  "long_shots": {"seuil": 60, "image": "/images/longshot.jpg", "recommendation": "Practice shooting from distance"},
  "aggression": {"seuil": 60, "image": "/images/aggression.jpg", "recommendation": "Channel aggression effectively in challenges"},
  "interceptions": {"seuil": 65, "image": "/images/interception.jpg", "recommendation": "Improve reading of the game and anticipation"},
  "positioning": {"seuil": 70, "image": "/images/positioning.jpg", "recommendation": "Work on spatial awareness and positioning"},
  "vision": {"seuil": 75, "image": "/images/vision.jpg", "recommendation": "Develop game intelligence and awareness"},
  "penalties": {"seuil": 65, "image": "/images/penalty.jpg", "recommendation": "Practice penalty techniques and composure"},
  "marking": {"seuil": 65, "image": "/images/marking.jpg", "recommendation": "Improve defensive positioning and tracking"},
  "standing_tackle": {"seuil": 70, "image": "/images/tackle.jpg", "recommendation": "Work on timing and technique in tackles"},
  "sliding_tackle": {"seuil": 60, "image": "/images/sliding.jpg", "recommendation": "Practice sliding tackle timing and safety"},
  "gk_diving": {"seuil": 70, "image": "/images/gkdiving.jpg", "recommendation": "Improve diving technique and reach"},
  "gk_handling": {"seuil": 75, "image": "/images/gkhandling.jpg", "recommendation": "Work on catching and parrying techniques"},
  "gk_kicking": {"seuil": 65, "image": "/images/gkkicking.jpg", "recommendation": "Practice distribution and kicking accuracy"},
  "gk_positioning": {"seuil": 75, "image": "/images/gkpositioning.jpg", "recommendation": "Improve positional awareness and angles"},
  "gk_reflexes": {"seuil": 80, "image": "/images/gkreflexes.jpg", "recommendation": "Develop quick reaction saves"}
}
EOF
fi

echo "Model initialization complete!"
echo "Please make sure to:"
echo "1. Copy your actual .pkl model files to shared/models/"
echo "2. Update the .env file with your actual API keys"
echo "3. Run 'docker-compose up -d' to start the application"