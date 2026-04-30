# Sumo-Guard System Architecture Documentation

This document contains the definitive Use Case and Entity-Relationship (ER) diagrams for the Sumo-Guard health tracking system. It includes all granular features (proper features) and clearly identifies all Actors.

## ChatGPT Prompt for UML Export

> **Prompt:**
> Act as a Senior Systems Architect. Generate a formal UML documentation for the 'Sumo-Guard' health application in PlantUML format.
> 
> **Specifications:**
> 1. **Use Case Diagram:** 
>    - **Primary Actor:** User (Stick figure on the left).
>    - **Secondary Actor:** Firebase Firestore (Box on the right).
>    - **System Boundary:** 'Sumo-Guard Application'.
>    - **Features:** Authentication, Detailed Onboarding, Habit Logging (Water, Exercise, Stress), Sleep Tracking, AI Disease Predictions (including contributing factors), and Health Statistics (filtered by day/month).
> 2. **ER Diagram:** 
>    - **Entities:** User, Sleep_Log, Habit_Log, Health_Profile.
>    - **Relationships:** One-to-Many for logs, One-to-One for Profile.
>    - **Attributes:** All fields including boolean flags and calculation fields.
> 3. **Format:** Monochrome (Black and White) with professional styling.

---

## 1. Professional Use Case Diagram

This diagram separates the User from the System and shows how the application interacts with external services (Firebase).

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#ffffff',
    'primaryTextColor': '#000000',
    'primaryBorderColor': '#000000',
    'lineColor': '#000000',
    'secondaryColor': '#ffffff',
    'tertiaryColor': '#ffffff',
    'mainBkg': '#ffffff',
    'nodeBorder': '#000000',
    'clusterBkg': '#ffffff',
    'clusterBorder': '#000000',
    'titleColor': '#000000',
    'edgeLabelBackground':'#ffffff'
  }
} }%%

flowchart LR
    %% Primary Actors
    User["👤 User\n(Patient/Sumo)"]
    Admin["🔑 Admin\n(System Manager)"]
    Expert["🩺 Health Expert\n(Doctor/Coach)"]
    
    %% System Boundary
    subgraph SystemBoundary [Sumo-Guard System Boundary]
        direction TB
        
        subgraph UC_Auth [Identity & Access]
            F1([Login / Registration])
            F2([Manage Personal Profile])
            F_Admin_Users([Manage All Users])
        end
        
        subgraph UC_Log [Data Tracking]
            F3([Log Sleep & Habits])
            F4([Log Lifestyle Metrics])
            F_Expert_Review([Review Patient Data])
        end
        
        subgraph UC_Insight [AI & Analytics]
            F6([AI Disease Risk Predictions])
            F7([View Personal Dashboard])
            F_Admin_Stats([View Global Analytics])
            F_Admin_Content([Manage AI Tips & Rules])
        end
    end

    %% Secondary Actors (External Systems)
    Firebase[["☁️ Firebase Firestore\n(Database/Auth)"]]
    AI_Engine[["🤖 AI Engine\n(Prediction Service)"]]

    %% User Relationships
    User --- F1
    User --- F2
    User --- F3
    User --- F4
    User --- F6
    User --- F7

    %% Admin Relationships
    Admin --- F1
    Admin --- F_Admin_Users
    Admin --- F_Admin_Stats
    Admin --- F_Admin_Content

    %% Expert Relationships
    Expert --- F1
    Expert --- F_Expert_Review

    %% System to External Service Connections
    UC_Auth -.-> Firebase
    UC_Log -.-> Firebase
    F6 -.-> AI_Engine
    F_Admin_Stats -.-> Firebase

    %% Styling
    style User fill:#fff,stroke:#000,stroke-width:3px
    style Admin fill:#fff,stroke:#000,stroke-width:3px
    style Expert fill:#fff,stroke:#000,stroke-width:3px
    style Firebase fill:#fff,stroke:#000,stroke-width:2px
    style AI_Engine fill:#fff,stroke:#000,stroke-width:2px
    style SystemBoundary fill:#fff,stroke:#000,stroke-width:2px,stroke-dasharray: 5 5
    style UC_Auth fill:#fff,stroke:#000
    style UC_Log fill:#fff,stroke:#000
    style UC_Insight fill:#fff,stroke:#000
```

---

## 2. Professional ER Model Diagram

A complete representation of the database schema, including all attributes and relationships.

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#ffffff',
    'primaryTextColor': '#000000',
    'primaryBorderColor': '#000000',
    'lineColor': '#000000',
    'secondaryColor': '#ffffff',
    'tertiaryColor': '#ffffff',
    'mainBkg': '#ffffff',
    'nodeBorder': '#000000',
    'clusterBkg': '#ffffff',
    'clusterBorder': '#000000',
    'titleColor': '#000000',
    'edgeLabelBackground':'#ffffff',
    'attributeFill': '#ffffff'
  }
} }%%

erDiagram
    USER ||--o{ SLEEP_LOG : "manages"
    USER ||--o{ HABIT_LOG : "tracks"
    USER ||--|| HEALTH_PROFILE : "possesses"

    USER {
        string uid PK "Firebase Auth UID"
        string name
        string email
        boolean onboardingDone
        string createdAt "ISO String"
    }

    SLEEP_LOG {
        string date PK "YYYY-MM-DD"
        string bedtime "ISO Date"
        string wakeTime "ISO Date"
        number durationHours "Calculated"
        string quality "poor | fair | good | excellent"
        string notes "Optional"
    }

    HABIT_LOG {
        string date PK "YYYY-MM-DD"
        number exerciseMinutes
        number waterGlasses
        number stressLevel "1 - 10 scale"
        number smokingCigarettes
        number alcoholDrinks
        number meditationMinutes
        number screenTimeHours
        number fruitVeggieServings
        string notes
    }

    HEALTH_PROFILE {
        string docId PK "main"
        number age
        string gender "male | female | other"
        number weight "kg"
        number height "cm"
        boolean isSmoker
        boolean isDrinker
        boolean isAlcoholic
        string activityLevel "sedentary to very_active"
        string dietType "standard to paleo"
        string_array chronicConditions "Diabetes, etc."
        string_array familyHistory "Genetic risks"
    }
```

## Summary of Proper Features

1.  **Actor Identification**: 
    *   **User**: The primary patient/user tracking their health.
    *   **Admin**: System manager responsible for user moderation and system-wide stats.
    *   **Health Expert**: A secondary role for doctors or coaches to review anonymized or shared patient data.
    *   **Firebase / AI Engine**: External services providing infrastructure and intelligence.
2.  **Admin & Other Flows**: 
    *   **Manage All Users**: Admin capability to oversee the user base.
    *   **Global Analytics**: Aggregated system-wide data (non-personal).
    *   **Expert Review**: Interface for professionals to provide feedback or review logs.
3.  **CRUD Operations**: Explicitly shows that logs can be added, viewed, and deleted.
4.  **Schema Completeness**: The ER model includes derived fields like `durationHours` and onboarding flags like `onboardingDone`.
