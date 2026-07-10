import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import auth

def create_admin():
    db: Session = SessionLocal()

    existing = db.query(models.PlayerModel).filter(models.PlayerModel.is_admin == True).first()
    if existing:
        print("Aquest equip ja té un administrador. Per crear més administradors, cal que ho faci un administrador existent.")
        db.close()
        return
    
    hashed_pass = auth.get_password_hash("admin")

    admin_user = models.PlayerModel(
        username = "admin_admin_admin",
        name="admin",
        surname1="admin",
        surname2="admin",
        prefered_name="admin",
        pronouns=models.PronounsEnum.THEY_THEM,

        sex=models.SexEnum.FEMALE,
        main_position=models.PositionEnum.LIBERO,

        role=models.UserRoleEnum.PLAYER,
        is_admin=True,

        hashed_password=hashed_pass
    )

    db.add(admin_user)
    db.commit()
    db.close()
    print("Administrador creat amb èxit. Nom d'usuari: 'admin', contrasenya: 'admin'.")

if __name__ == "__main__":
    create_admin()