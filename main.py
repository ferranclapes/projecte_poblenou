from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models

# Force SQLAlchemy to create the database tables if non existent
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Atlètic Poblenou app - API")

# -----------------------------------------------------------------------------
# 1. SCHEMAS (Pydantic): Define how is the data we receive or send
# -----------------------------------------------------------------------------

class CreatePlayer(BaseModel):
    name: str
    gender: models.GenderEnum
    main_position: models.PositionEnum
    secondary_position: Optional[models.PositionEnum] = None

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
# 3. API ENDPOINTS: Rutes of the API connected to the DB
# --------------------------------------------------------------------------------

# --- 1. PLAYER ---
@app.post("/players/", response_model=PlayerResponse, status_code=201)
def create_player(player: CreatePlayer, db: Session = Depends(get_db)):
    db_player = models.PlayerModel(
        name=player.name,
        gender=player.gender,
        main_position=player.main_position,
        secondary_position=player.secondary_position,
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@app.get("/players/", response_model=List[PlayerResponse])
def list_players(db: Session = Depends(get_db)):
    return db.query(models.PlayerModel).all()

# --- 2. EVENT ---
@app.post("/events/", response_model=EventResponse, status_code=201)
def create_event(event: CreateEvent, db: Session = Depends(get_db)):
    db_event = models.EventModel(
        event_type=event.event_type,
        name=event.name,
        date_time=event.date_time,
        location=event.location
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/events/", response_model=List[EventResponse])
def list_events(db: Session = Depends(get_db)):
    db_events = db.query(models.EventModel).all()    
    return db_events

# --- 3. ASSISTANCE ---
@app.post("/events/{event_id}/assistances/")
def register_assistance(event_id: int, assistance: UpdateAssistance, db: Session = Depends(get_db)):
    event_exists = db.query(models.EventModel).filter(models.EventModel.id == event_id).first()
    if not event_exists:
        raise HTTPException(status_code=404, detail="Event not found")

    player_exists = db.query(models.PlayerModel).filter(models.PlayerModel.id == assistance.player_id).first()
    if not player_exists:
        raise HTTPException(status_code=404, detail="Player not found")
    
    db_assistance = db.query(models.AssistanceModel).filter(
        models.AssistanceModel.event_id == event_id,
        models.AssistanceModel.player_id == assistance.player_id
    ).first()
    if db_assistance:
        db_assistance.status = assistance.status
        db_assistance.comment = assistance.comment
    else:
        db_assistance = models.AssistanceModel(
            player_id=assistance.player_id,
            event_id=event_id,
            status=assistance.status,
            comment=assistance.comment
        )
        db.add(db_assistance)

    db.commit()
    return {"status": "success", "message": f"Assistance updated to {assistance.status} for player {assistance.player_id} in event {event_id}"}

# --- 4. EVENT SUMMARY ---
@app.get("/events/{event_id}/summary/")
def get_event_summary(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.EventModel).filter(models.EventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    total_confirmed = 0
    gender_balance = {models.GenderEnum.MALE: 0, models.GenderEnum.FEMALE: 0}
    position_balance = {
        models.PositionEnum.SETTER: 0,
        models.PositionEnum.MIDDLE: 0,
        models.PositionEnum.OPPOSITE: 0,
        models.PositionEnum.OUTSIDE: 0,
        models.PositionEnum.LIBERO: 0
    }

    confirmed_assistances = db.query(models.AssistanceModel).filter(
        models.AssistanceModel.event_id == event_id,
        models.AssistanceModel.status == models.AssistanceStatusEnum.ASSISTING
    ).all()
    for assistance in confirmed_assistances:
        total_confirmed += 1

        player = db.query(models.PlayerModel).filter(models.PlayerModel.id == assistance.player_id).first()
        if player:
            gender_balance[player.gender] += 1
            position_balance[player.main_position] += 1
    
    return {
        "event_id": event_id,
        "event_name": event.name,
        "total_confirmed": total_confirmed,
        "gender_balance": gender_balance,
        "position_balance": position_balance
    }