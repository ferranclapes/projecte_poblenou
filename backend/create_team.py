from sqlalchemy.orm import Session
from database import SessionLocal
import models

def create_team(name: str):
    db: Session = SessionLocal()

    
    
    new_team = models.TeamModel(
        name=name,
        category=None
    )

    db.add(new_team)
    db.commit()
    db.close()
    print(f"Equip creat amb èxit. Nom: {name}.")

if __name__ == "__main__":
    name = input("Introdueix el nom de l'equip que vols crear: ")
    create_team(name)