from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import backend.models as models

# -----------------------------------------------------------------------------
# 1. SCHEMAS (Pydantic): Define how is the data we receive or send
# -----------------------------------------------------------------------------

class LoginRequest(BaseModel):
    username: str
    password: str

class PlayerBase(BaseModel):
    name: str
    surname1: str
    surname2: str
    prefered_name: Optional[str] = None
    pronouns: Optional[models.PronounsEnum] = None

    club: Optional[str] = None
    team: Optional[str] = None
    sex: models.SexEnum
    main_position: models.PositionEnum
    secondary_position: Optional[models.PositionEnum] = None

    role: Optional[models.UserRoleEnum] = models.UserRoleEnum.PLAYER

class CreatePlayer(PlayerBase):
    password: str

class PlayerResponse(PlayerBase):
    id: int
    is_admin: bool

    class Config:
        from_attributes = True

class PermissionsUpdate(BaseModel):
    role: models.UserRoleEnum
    is_admin: bool

class CreateEvent(BaseModel):
    event_type: str
    name: Optional[str] = None
    date_time: datetime
    location: Optional[str] = None
    description: Optional[str] = None

class EventResponse(CreateEvent):
    id: int

class UpdateAssistance(BaseModel):
    player_id: int
    status: str
    comment: Optional[str] = None

class TeamBase(BaseModel):
    name: str
    category: Optional[str] = None

class TeamResponse(TeamBase):
    id: int

    class Config:
        from_attributes = True