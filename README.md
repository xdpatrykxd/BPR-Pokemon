# Pokémon Buddy & Battle System - README  

## Overview  
This project is a Pokémon-themed web application developed during our first year of programming. It allows users to create profiles, collect Pokémon, engage in battles, and play various Pokémon-related mini-games.  

## Features  

### User Management  
- **Registration & Login** with secure password hashing (bcrypt)  
- Persistent **session management**  
- Unique profiles with Pokémon collections  

### Pokémon System  
- Collect **1024 different Pokémon species**  
- **Buddy system** (select a main Pokémon)  
- Detailed stats for each Pokémon:  
  - Height/weight/species data  
  - Battle records (wins/losses)  
  - Base stats (HP, attack, defense, etc.)  
  - Types and sprites  

### Game Features  
- **Battling system** (buddy vs wild Pokémon)  
- **Catching mechanic** with chance-based success  
- **"Who's That Pokémon?"** guessing game  
- Pokémon stat comparison tool  
- Team management interface  

## Technical Stack  
- **Backend**: Express.js + TypeScript  
- **Database**: MongoDB (stores users and Pokémon)  
- **Authentication**: Session-based with JWT  
- **Data Source**: PokeAPI integration  
- **Frontend**: EJS templates + vanilla CSS/JS  

## Setup Guide  

1. **Requirements**:  
   - Node.js  
   - MongoDB (local or cloud)  

2. **Environment variables** (`.env` file):  
  urlMongo=your_mongodb_connection_string
  JWT_SECRET=your_secret_key
  port=3000
  secure=false

3. **Installation**:  
```bash
npm install
npm start
