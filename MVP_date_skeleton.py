from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import Boolean, Column, DateTime, Enum as SQLEnum, ForeignKey, Integer, String
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

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

class EventTypeEnum(str, Enum):
    TRAINING = "Entrenament"
    MATCH = "Partit"
    TOURNAMENT = "Torneig"

class AssistanceStatusEnum(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"
    EXCUSED = "Excusat"
    NOT_CONFIRMED = "No confirmat"

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String,  nullable=False)
    gender = Column(SQLEnum(GenderEnum), nullable=False)
    main_position = Column(SQLEnum(PositionEnum), nullable=False)
    secondary_position = Column(SQLEnum(PositionEnum), nullable=True)
    is_admin = Column(Boolean, default=False)

    assistances = relationship("Assistance", back_populates="player")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(SQLEnum(EventTypeEnum), nullable=False)
    name = Column(String, nullable=True)
    date_time = Column(DateTime, nullable=False)
    location = Column(String, nullable=True)
    #limit_confirmation_date ?

    assistances = relationship("Assistance", back_populates="event")

class Assistance(Base):
    __tablename__ = "assistances"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    status = Column(SQLEnum(AssistanceStatusEnum), default=AssistanceStatusEnum.NOT_CONFIRMED, nullable=False)
    comment = Column(String, nullable=True)
    updated_date = Column(DateTime, default=datetime.timezone.utc, onupdate=datetime.timezone.utc)

    player = relationship("Player", back_populates="assistances")
    event = relationship("Event", back_populates="assistances")