from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from enum import Enum

# Initialize FastAPI app
app = FastAPI(title="Atlètic Poblenou app - API")

# -----------------------------------------------------------------------------
# 1. SCHEMAS (Pydantic): Define how is the data we receive or send
# -----------------------------------------------------------------------------

class GenderEnum(str, Enum):
    MALE = "Masculí"
    FEMALE = "Femení"
    OTHER = "Altres"

class PositionEnum(str, Enum):
    SETTER = "Col·locador/a"
    MIDDLE = "Central"
    OPPOSITE = "Oposat/da"
    OUTSIDE = "Punta"
    LIBERO = "Líbero"

class AssistanceStatusEnum(str, Enum):
    CONFIRMED_YES = "Si que ve"
    CONFIRMED_NO = "No ve"
    NOT_CONFIRMED = "No confirmat"

class CreatePlayer(BaseModel):
    name: str
    gender: GenderEnum
    main_position: PositionEnum
    secondary_position: Optional[PositionEnum] = None

class PlayerResponse(CreatePlayer):
    id: int
    is_admin: bool

    class Config:
        from_attributes = True

class CreateEvent(BaseModel):
    event_type: str
    name: Optional[str] = None
    date_time: datetime
    location: Optional[str] = None

class EventResponse(CreateEvent):
    id: int

class UpdateAssistance(BaseModel):
    player_id: int
    status: str
    comment: Optional[str] = None

# --------------------------------------------------------------------------------
# 2. SIMULATED DB: Temporary in-memory storage
# --------------------------------------------------------------------------------

db_players = []
db_events = []
db_assistances = {}

# --------------------------------------------------------------------------------
# 3. API ENDPOINTS: Rutes of the API
# --------------------------------------------------------------------------------

# --- RUTE 1: Create a new player ---
@app.post("/players/", response_model=PlayerResponse, status_code=201)
def create_player(player: CreatePlayer):
    # Generate a new ID #! This is too simple and doesn't handle deletions or concurrency, but it's enough for this example.
    new_id = len(db_players) + 1

    # Create the final object
    new_player = PlayerResponse(
        id=new_id,
        name = player.name,
        gender = player.gender,
        main_position = player.main_position,
        secondary_position = player.secondary_position,
        is_admin=False
    )

    # Store it in the simulated DB
    db_players.append(new_player)
    return new_player

# --- RUTE 2: List all players ---
@app.get("/players/", response_model=List[PlayerResponse])
def list_players():
    return db_players

# --- RUTE 3: Create a new event ---
@app.post("/events/", response_model=EventResponse, status_code=201)
def create_event(event: CreateEvent):
    #! El mateix que jugadors
    new_id = len(db_events) + 1

    new_event = EventResponse(
        id=new_id,
        event_type = event.event_type,
        name = event.name,
        date_time = event.date_time,
        location = event.location
    )

    db_events.append(new_event)

    # Initialize the assistance void for this event
    db_assistances[new_id]= {}

    return new_event

# --- Rute 4: Get List of all events ---
@app.get("/events/", response_model=List[EventResponse])
def list_events():
    return db_events

# --- RUTE 5: Set assistance ---
@app.post("/events/{event_id}/assistances/")
def register_assistance(event_id: int, assistance: UpdateAssistance):
    if event_id not in db_assistances:
        raise HTTPException(status_code=404, detail="Event not found")
    
    player_exists = any(j.id == assistance.player_id for j in db_players)
    if not player_exists:
        raise HTTPException(status_code=404, detail="Player not found")
    
    db_assistances[event_id][assistance.player_id] = {
        "status": assistance.status,
        "comment": assistance.comment,
        "update_date": datetime.now().isoformat()
    }

    return {"status": "success", "message": f"Assistance updated for player {assistance.player_id} to {assistance.status} for event {event_id}"}

# --- RUTE 6: Get summary for an event ---
@app.get("/events/{event_id}/summary/")
def get_event_summary(event_id: int):
    if event_id not in db_assistances:
        raise HTTPException(status_code=404, detail="Event not found")
    
    total_confirmed = 0
    gender_balance = {GenderEnum.MALE: 0, GenderEnum.FEMALE: 0, GenderEnum.OTHER: 0}
    position_balance = {PositionEnum.SETTER: 0, PositionEnum.MIDDLE: 0, PositionEnum.OPPOSITE: 0, PositionEnum.OUTSIDE: 0, PositionEnum.LIBERO: 0}

    assistances = db_assistances[event_id]

    for player_id, assistance_data in assistances.items():
        if assistance_data["status"] == AssistanceStatusEnum.CONFIRMED_YES:
            total_confirmed += 1

            player = next((p for p in db_players if p.id == player_id), None)
            if player:

                gender = player.gender
                if gender in gender_balance:
                    gender_balance[gender] += 1

                position = player.main_position
                if position in position_balance:
                    position_balance[position] += 1

    return {
        "event_id": event_id,
        "total_confirmed": total_confirmed,
        "gender_balance": gender_balance,
        "position_balance": position_balance
    }