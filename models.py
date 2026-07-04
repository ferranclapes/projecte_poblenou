from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base

class GenderEnum(str, Enum):
    MALE = "Masculí"
    FEMALE = "Femení"

class PositionEnum(str, Enum):
    SETTER = "Col·locador"
    MIDDLE = "Central"
    OUTSIDE = "Punta"
    OPPOSITE = "Oposat"
    LIBERO = "Libero"

class EventTypeEnum(str, Enum):
    MATCH = "Partit"
    TRAINING = "Entrenament"

class AssistanceStatusEnum(str, Enum):
    ASSISTING = "Assisteix"
    NOT_ASSISTING = "No assisteix"
    DONT_KNOW = "Dubte"

class PlayerModel(Base):
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    gender = Column(SQLEnum(GenderEnum), nullable=False)
    main_position = Column(SQLEnum(PositionEnum), nullable=False)
    secondary_position = Column(SQLEnum(PositionEnum), nullable=True)
    is_admin = Column(Boolean, default=False)
    
    assistances = relationship("AssistanceModel", back_populates="player")

class EventModel(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(SQLEnum(EventTypeEnum), nullable=False)
    name = Column(String, nullable=True)
    date_time = Column(DateTime, nullable=False)
    location = Column(String, nullable=True)
    
    assistances = relationship("AssistanceModel", back_populates="event")

class AssistanceModel(Base):
    __tablename__ = "assistances"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    status = Column(SQLEnum(AssistanceStatusEnum), default=AssistanceStatusEnum.DONT_KNOW, nullable=False)
    comment = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    player = relationship("PlayerModel", back_populates="assistances")
    event = relationship("EventModel", back_populates="assistances")