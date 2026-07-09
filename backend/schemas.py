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
    gender: models.GenderEnum
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