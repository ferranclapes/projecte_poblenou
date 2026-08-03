from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Table, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.database import Base

class UserRoleEnum(str, Enum):
    PLAYER = "jugador"
    COACH = "entrenador"

class SexEnum(str, Enum):
    MALE = "Home"
    FEMALE = "Dona"

class PronounsEnum(str, Enum):
    HE_HIM = "Ell"
    SHE_HER = "Ella"
    THEY_THEM = "Elle"
    OTHER = "Altres"

class PositionEnum(str, Enum):
    SETTER = "Col·locador"
    MIDDLE = "Central"
    OUTSIDE = "Punta"
    OPPOSITE = "Oposat"
    LIBERO = "Líbero"

class EventTypeEnum(str, Enum):
    MATCH = "Partit"
    TRAINING = "Entrenament"

class AssistanceStatusEnum(str, Enum):
    ASSISTING = "Assisteix"
    NOT_ASSISTING = "No assisteix"
    DONT_KNOW = "Dubte"


# --- TAULES INTERMÈDIES PER A RELACIONS MOLTS A MOLTS (Many-to-Many) ---

player_teams = Table(
    "player_teams",
    Base.metadata,
    Column("player_id", Integer, ForeignKey("players.id", ondelete="CASCADE"), primary_key=True),
    Column("team_id", Integer, ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True)
)

event_teams = Table(
    "event_teams",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("team_id", Integer, ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True)
)

# --- MODELS (SQLAlchemy): Define how is the data stored in the database ---

class PlayerModel(Base):
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), unique=True, index=True, nullable=True)

    # Personal information
    name = Column(String(100), nullable=False)
    surname1 = Column(String(100), nullable=False)
    surname2 = Column(String(100), nullable=False)
    prefered_name = Column(String(100), nullable=True)
    pronouns = Column(SQLEnum(PronounsEnum), nullable=True)

    # Volleyball-specific attributes
    sex = Column(SQLEnum(SexEnum), nullable=False)
    main_position = Column(SQLEnum(PositionEnum), nullable=False)
    secondary_position = Column(SQLEnum(PositionEnum), nullable=True)

    # User role and admin status
    role = Column(SQLEnum(UserRoleEnum), default=UserRoleEnum.PLAYER, nullable=False)
    is_admin = Column(Boolean, default=False)

class EventModel(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(SQLEnum(EventTypeEnum), nullable=False)
    name = Column(String(255), nullable=True)
    date_time = Column(DateTime, nullable=False)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

class AssistanceModel(Base):
    __tablename__ = "assistances"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(AssistanceStatusEnum), default=AssistanceStatusEnum.DONT_KNOW, nullable=False)
    comment = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class TeamModel(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(150), nullable=True)    #Lliga i divisió de l'equip
