from dotenv import load_dotenv
#load_dotenv()  # Això llegeix el fitxer .env de la carpeta

from sqlalchemy.orm import Session
from backend.database import SessionLocal, Base, Engine
import backend.models as models
import backend.auth as auth

def create_admin():
    db: Session = SessionLocal()

    existing = db.query(models.UserModel).filter(models.UserModel.is_admin == True).first()
    if existing:
        print("Aquest equip ja té un administrador. Per crear més administradors, cal que ho faci un administrador existent.")
        db.close()
        return
    
    hashed_pass = auth.get_password_hash("admin")

    admin_user = models.AdminModel(
        username = "admin_admin_admin",
        name="admin",
        surname1="admin",
        surname2="admin",
        prefered_name="admin",
        pronouns=models.PronounsEnum.THEY_THEM,
        is_admin=True,

        hashed_password=hashed_pass
    )

    db.add(admin_user)
    db.commit()
    db.close()
    print("Administrador creat amb èxit. Nom d'usuari: 'admin', contrasenya: 'admin'.")

if __name__ == "__main__":

    Base.metadata.create_all(bind=Engine)  # Crea les taules si no existeixen
    create_admin()