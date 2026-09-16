from dateutil.relativedelta import relativedelta
from datetime import timedelta

from fastapi import FastAPI, HTTPException, Depends
from typing import List
from sqlalchemy import text
from sqlalchemy.orm import Session, selectinload

from backend.database import engine, Base, get_db
import backend.models as models
import backend.schemas as schemas

import backend.auth as auth
from fastapi.security import HTTPBearer

# Force SQLAlchemy to create the database tables if non existent
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Atlètic Poblenou app - API")
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
   "https://projecte-poblenou.pages.dev/"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# --------------------------------------------------------------------------------
# 3. API ENDPOINTS: Rutes of the API connected to the DB
# --------------------------------------------------------------------------------

# --- 1. PLAYER ---
@app.post("/players", response_model=schemas.PlayerResponse, status_code=201)
def create_player(player: schemas.CreatePlayer, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['role'] != models.UserRoleEnum.COACH.value and current_user['is_admin'] != True:
        raise HTTPException(status_code=403, detail="Només els coaches i els administradors poden actualitzar el perfil.")
    
    existing_player = db.query(models.PlayerModel).filter(models.PlayerModel.name == player.name).first()
    if existing_player:
       raise HTTPException(status_code=400, detail="Ja existeix un jugador amb aquest nom.")
    
    plain_password = str(player.password)
    hashed_password = auth.get_password_hash(plain_password)

    if player.prefered_name is None:
        player.prefered_name = player.name

    db_player = models.PlayerModel(
        username=f"{player.name.lower()}_{player.surname1.lower()}_{player.surname2.lower()}",

        name=player.name,
        surname1=player.surname1,
        surname2=player.surname2,
        prefered_name=player.prefered_name,
        pronouns=player.pronouns,

        sex=player.sex,
        main_position=player.main_position,
        secondary_position=player.secondary_position,

        role = player.role,

        hashed_password=hashed_password,
        is_admin = True if player.role == models.UserRoleEnum.COACH.value else False
    )

    if player.team_ids:
        teams = db.query(models.TeamModel).filter(models.TeamModel.id.in_(player.team_ids)).all()
        db_player.teams = teams
                
    db.add(db_player)
    db.commit()
    db.refresh(db_player)

    return db_player

@app.get("/players", response_model=List[schemas.PlayerResponse])
def list_players(db: Session = Depends(get_db)):
    players = db.query(models.PlayerModel).options(
        selectinload(models.PlayerModel.teams)
    ).order_by(models.PlayerModel.name.asc()).all()
    return players

@app.get("/players/{player_id}", response_model=schemas.PlayerResponse)
def get_player(player_id: int, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    player = db.query(models.PlayerModel).filter(models.PlayerModel.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Jugador no trobat")
    return player

@app.patch("/players/{player_id}")
def update_player_profile(player_id: int, player_data: dict, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['role'] != models.UserRoleEnum.COACH.value and current_user['is_admin'] != True and current_user['id'] != player_id:
        raise HTTPException(status_code=403, detail="Només els coaches i els administradors poden actualitzar el perfil.")

    db_player = db.query(models.PlayerModel).filter(models.PlayerModel.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    for key, value in player_data.items():
        if hasattr(db_player, key):
            setattr(db_player, key, value)

    if "name" in player_data or "surname1" in player_data or "surname2" in player_data:
        db_player.username = f"{db_player.name}_{db_player.surname1}_{db_player.surname2}"

    db.commit()
    db.refresh(db_player)
    return {"status": "success", "message": "Perfil actualitzat correctament"}

@app.put("/players/{player_id}/teams")
def update_player_teams(player_id: int, payload: dict, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['role'] != models.UserRoleEnum.COACH.value and current_user['is_admin'] != True:
        raise HTTPException(status_code=403, detail="Només els coaches i els administradors poden actualitzar els equips d'un jugador.")

    db_player = db.query(models.PlayerModel).filter(models.PlayerModel.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Remove existing team associations
    db.execute(text("DELETE FROM player_teams WHERE player_id = :p_id"), {"p_id": player_id})

    team_ids = payload.get("team_ids", [])
    # Add new team associations
    for team_id in team_ids:
        db.execute(text("INSERT INTO player_teams (player_id, team_id) VALUES (:p_id, :t_id)"), {"p_id": player_id, "t_id": team_id})
    
    db.commit()
    return {"status": "success", "message": "Equips del jugador actualitzats correctament"}

@app.put("players/{player_id}/teams/{team_id}")
def assign_player_to_team(player_id: int, team_id: int, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user["is_admin"] != True:
        raise HTTPException(status_code=403, detail="Només els administradors poden assignar jugadors a equips.")
    
    check_query = text("SELECT * FROM player_teams WHERE player_id = :p_id AND team_id = :t_id")
    existing = db.execute(check_query, {"p_id": player_id, "t_id": team_id}).fetchone()
    if existing:
        return {"status": "info", "message": f"El jugador {player_id} ja està assignat a l'equip {team_id}."}
    
    insert_query = text("INSERT INTO player_teams (player_id, team_id) VALUES (:p_id, :t_id)")
    db.execute(insert_query, {"p_id": player_id, "t_id": team_id})
    db.commit()

    return {"status": "success", "message": f"Jugador {player_id} assignat a l'equip {team_id} correctament."}

@app.post("/players/{player_id}/change-password")
def change_password(player_id: int, password_data: schemas.ChangePasswordRequest, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['id'] != player_id and current_user['is_admin'] != True:
        raise HTTPException(status_code=403, detail="Només el propi usuari o un administrador poden canviar la contrasenya.")

    db_player = db.query(models.PlayerModel).filter(models.PlayerModel.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Usuari no trobat")

    if not auth.verify_password(password_data.current_password, db_player.hashed_password):
        raise HTTPException(status_code=400, detail="La contrassenya actual és incorrecta.")

    new_hashed_password = auth.get_password_hash(password_data.new_password)
    db_player.hashed_password = new_hashed_password
    db.commit()

    return {"status": "success", "message": "Contrasenya canviada correctament"}

@app.post("/players/{player_id}/reset-password")
def reset_password(player_id: int, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['is_admin'] != True:
        raise HTTPException(status_code=403, detail="Només els administradors poden reiniciar la contrasenya d'un jugador.")

    db_player = db.query(models.PlayerModel).filter(models.PlayerModel.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Jugador no trobat")

    # Reset password to prefered_name or name if prefered_name is empty
    new_password = db_player.prefered_name+db_player.surname1 if db_player.prefered_name else db_player.name+db_player.surname1
    new_hashed_password = auth.get_password_hash(new_password)
    db_player.hashed_password = new_hashed_password
    db.commit()

    return {"status": "success", "message": f"Contrasenya reiniciada correctament. La nova contrassenya temporal és: '{new_password}'."}

@app.delete("/players/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['is_admin'] != True:
        raise HTTPException(status_code=403, detail="Només els administradors poden eliminar jugadors.")

    player = db.query(models.PlayerModel).filter(models.PlayerModel.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Jugador no trobat")

    db.execute(text("DELETE FROM player_teams WHERE player_id = :p_id"), {"p_id": player_id})
    
    db.delete(player)
    db.commit()
    return {"status": "success", "message": f"Jugador {player_id} eliminat correctament"}

# --- 2. EVENT ---
@app.post("/events", status_code=201)
def create_event(event: schemas.CreateEvent, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['is_admin'] != True and current_user.get('role') != models.UserRoleEnum.COACH.value:
        raise HTTPException(status_code=403, detail="Només els entrenadors o administradors poden crear esdeveniments.")

    if event.is_periodic:
        if not event.periodicity or not event.occurrences:
            raise HTTPException(status_code=400, detail="Si l'esdeveniment és periòdic, cal especificar la freqüència i el nombre d'ocurrències.")
        if event.occurrences <= 0:
            raise HTTPException(status_code=400, detail="El nombre d'ocurrències ha de ser un enter positiu.")
        if event.periodicity not in ["diaria", "setmanal", "mensual"]:
            raise HTTPException(status_code=400, detail="La freqüència ha de ser 'diaria', 'setmanal' o 'mensual'.")

    created_events = []
    occurrences = event.occurrences if event.is_periodic else 1

    for i in range(occurrences):
        # Càlcul de la data segons la periodicitat
        if not event.is_periodic:
            new_date_time = event.date_time
        elif event.periodicity == "diaria":
            new_date_time = event.date_time + timedelta(days=i)
        elif event.periodicity == "setmanal":
            new_date_time = event.date_time + timedelta(weeks=i)
        elif event.periodicity == "mensual":
            new_date_time = event.date_time + relativedelta(months=i)

        db_event = models.EventModel(
            event_type=event.event_type,
            name=event.name,
            date_time=new_date_time,
            location=event.location,
            description=event.description
        )
        db.add(db_event)
        db.commit()
        db.refresh(db_event)

        # Associar equips a l'esdeveniment
        if event.team_ids:
            for team_id in event.team_ids:
                db.execute(
                    text("INSERT INTO event_teams (event_id, team_id) VALUES (:e_id, :t_id)"),
                    {"e_id": db_event.id, "t_id": team_id}
                )
            db.commit()

        created_events.append(db_event)

    # Si s'ha creat un de sol, retornem l'objecte; si són múltiples, podem retornar l'últim o una llista
    return created_events[-1] if len(created_events) == 1 else {"message": f"S'han creat {len(created_events)} esdeveniments correctament."}

@app.get("/events", response_model=List[schemas.EventResponse])
def list_events(db: Session = Depends(get_db)):
    # 1. Carreguem tots els esdeveniments i els seus equips de cop amb una única consulta optimitzada
    db_events = db.query(models.EventModel).options(
        selectinload(models.EventModel.teams)
    ).all()

    response_events = []
    for event in db_events:
        # 2. Extrec els IDs dels equips directament de la relació ja carregada a memòria (sense SQL extra)
        team_ids = [t.id for t in event.teams]

        event_data = {
            "id": event.id,
            "event_type": event.event_type,
            "name": event.name,
            "date_time": event.date_time,
            "location": event.location,
            "description": event.description,
            "team_ids": team_ids
        }
        response_events.append(event_data)

    return response_events

@app.put("/events/{event_id}")
def update_event(event_id: int, event_data: schemas.CreateEvent, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['is_admin'] != True and current_user['role'] != models.UserRoleEnum.COACH.value:
        raise HTTPException(status_code=403, detail="Només els entrenadors o administradors poden actualitzar esdeveniments.")

    db_event = db.query(models.EventModel).filter(models.EventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db_event.event_type = event_data.event_type
    db_event.name = event_data.name
    db_event.date_time = event_data.date_time
    db_event.location = event_data.location
    db_event.description = event_data.description

    delete_query = text("DELETE FROM event_teams WHERE event_id = :e_id")
    db.execute(delete_query, {"e_id": event_id})

    print(f"Assigning event {event_id} to teams: {event_data.team_ids}")

    if event_data.team_ids:
        for team_id in event_data.team_ids:
            db.execute(
                text("INSERT INTO event_teams (event_id, team_id) VALUES (:e_id, :t_id)"),
                {"e_id": event_id, "t_id": team_id}
            )

    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['is_admin'] != True and current_user['role'] != models.UserRoleEnum.COACH.value:
        raise HTTPException(status_code=403, detail="Només els entrenadors o administradors poden eliminar esdeveniments.")

    event = db.query(models.EventModel).filter(models.EventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.execute(text("DELETE FROM event_teams WHERE event_id = :e_id"), {"e_id": event_id})
    
    db.delete(event)
    db.commit()
    return {"status": "success", "message": f"Event {event_id} deleted successfully"}

@app.post("/events/{event_id}/teams/{team_id}")
def assign_event_to_team(event_id: int, team_id: int, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user["is_admin"] != True and current_user['role'] != models.UserRoleEnum.COACH.value:
        raise HTTPException(status_code=403, detail="Només els entrenadors o administradors poden assignar esdeveniments a equips.")
    
    check_query = text("SELECT * FROM event_teams WHERE event_id = :e_id AND team_id = :t_id")
    existing = db.execute(check_query, {"e_id": event_id, "t_id": team_id}).fetchone()
    if existing:
        return {"status": "info", "message": f"L'esdeveniment {event_id} ja està assignat a l'equip {team_id}."}
    
    insert_query = text("INSERT INTO event_teams (event_id, team_id) VALUES (:e_id, :t_id)")
    db.execute(insert_query, {"e_id": event_id, "t_id": team_id})
    db.commit()

    return {"status": "success", "message": f"Esdeveniment {event_id} assignat a l'equip {team_id} correctament."}


# --- 3. ASSISTANCE ---
@app.post("/events/{event_id}/assistances")
def register_assistance(event_id: int, assistance: schemas.UpdateAssistance, db: Session = Depends(get_db)):
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
@app.get("/events/{event_id}/summary")
def get_event_summary(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.EventModel).filter(models.EventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    total_confirmed = 0
    sex_balance = {models.SexEnum.MALE.value: 0, models.SexEnum.FEMALE.value: 0}
    position_balance = {
        models.PositionEnum.SETTER.value: 0,
        models.PositionEnum.MIDDLE.value: 0,
        models.PositionEnum.OPPOSITE.value: 0,
        models.PositionEnum.OUTSIDE.value: 0,
        models.PositionEnum.LIBERO.value: 0
    }

    confirmed_assistances = db.query(models.AssistanceModel).filter(
        models.AssistanceModel.event_id == event_id,
        models.AssistanceModel.status == models.AssistanceStatusEnum.ASSISTING.value
    ).all()
    for assistance in confirmed_assistances:
        total_confirmed += 1

        player = db.query(models.PlayerModel).filter(models.PlayerModel.id == assistance.player_id).first()
        if player:
            sex_balance[player.sex] += 1
            position_balance[player.main_position] += 1
    
    return {
        "event_id": event_id,
        "event_name": event.name,
        "total_confirmed": total_confirmed,
        "sex_balance": sex_balance,
        "position_balance": position_balance
    }

# --- 5. AUTHENTICATION ---
@app.post("/auth/login")
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    db_player = db.query(models.PlayerModel).filter(models.PlayerModel.username == login_data.username).first()
    if not db_player:
        raise HTTPException(status_code=401, detail="Nom d'usuari")
                                                                                    #! Change message to make them ambiguous
    if not auth.verify_password(login_data.password, db_player.hashed_password):
        raise HTTPException(status_code=401, detail="contrasenya incorrectes")
    
    access_token = auth.create_access_token(data={"id": db_player.id, "user": db_player.username, "role": db_player.role.value, "is_admin": db_player.is_admin})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_player.role.value,
        "is_admin": db_player.is_admin,
        "player_id": db_player.id,
        "player_username": db_player.username,  
        "prefered_name": db_player.prefered_name,
        "team_ids": [team.id for team in db_player.teams]
    }

# --- 6. TEAMS ---
@app.post("/teams", response_model=schemas.TeamResponse, status_code=201)
def create_team(team: schemas.TeamBase, db: Session = Depends(get_db), current_user: dict = Depends(auth.get_current_user)):
    if current_user['is_admin'] != True:
        raise HTTPException(status_code=403, detail="Només els administradors poden crear equips.")

    db_team = models.TeamModel(
        name=team.name,
        category=team.category
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@app.get("/teams", response_model=List[schemas.TeamResponse], status_code=201)
def list_teams(db: Session = Depends(get_db)):
    query = text("SELECT * FROM teams ORDER BY name ASC")
    result = db.execute(query)
    return [dict(row._mapping) for row in result]

# --- 7. UTILS ---
@app.get("/utils/enums")
def get_enums():
    return {
        "positions": [{"label": position.value, "value": position.value} for position in models.PositionEnum],
        "roles": [{"label": role.value, "value": role.value} for role in models.UserRoleEnum],
        "sexes": [{"label": sex.value, "value": sex.value} for sex in models.SexEnum],
        "pronouns": [{"label": pronoun.value, "value": pronoun.value} for pronoun in models.PronounsEnum]
    }