# Sumo-Guard System Architecture

This document contains the high-level system architecture of the Sumo-Guard application, including the interaction between the frontend, the analytical core, and the cloud infrastructure.

## Prompt for ChatGPT

> **Prompt:**
> Act as a Solution Architect. Generate a high-level System Architecture Diagram for the 'Sumo-Guard' cross-platform health application.
> 
> **Requirements:**
> 1. **Layers:** 
>    - **Presentation Layer:** React, Vite, Tailwind CSS, Recharts.
>    - **Logic Layer:** React Query, Prediction Engine (Local).
>    - **Infrastructure Layer:** Firebase Auth, Firestore.
>    - **Nativization:** Capacitor.js, Android Container.
> 2. **Interactions:** Show how data flows from Firestore to the Prediction Engine and then to the UI.
> 3. **Visual Style:** Professional **Black and White** (monochrome) format.
> 4. **Output:** Provide the Mermaid code.

---

## System Architecture Diagram (Mermaid)

This diagram is rendered in high-contrast black and white, showing the structural layers of the application.

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

flowchart TD
    subgraph ClientApp ["📱 Client Side (React + Capacitor)"]
        direction TB
        subgraph UI ["Presentation Layer"]
            ReactUI[React.js / Vite]
            Charts[Recharts / Framer Motion]
        end
        
        subgraph Logic ["Application Logic"]
            RQuery[React Query]
            Engine[AI Prediction Engine]
        end
        
        subgraph Native ["Mobile Native Layer"]
            Capacitor[Capacitor.js Bridge]
            Android[Android Container]
        end
    end

    subgraph Infrastructure ["☁️ Cloud Services (Firebase)"]
        Auth[Firebase Authentication]
        DB[(Cloud Firestore)]
    end

    %% Interactions
    User((👤 User)) <--> ReactUI
    ReactUI <--> RQuery
    RQuery <--> Auth
    RQuery <--> DB
    
    DB -- "Health Logs" --> Engine
    Engine -- "Risk Scores" --> Charts
    Charts --> ReactUI
    
    ReactUI <--> Capacitor
    Capacitor <--> Android

    %% Styling
    style User fill:#fff,stroke:#000,stroke-width:2px
    style ClientApp fill:#fff,stroke:#000,stroke-width:2px,stroke-dasharray: 5 5
    style Infrastructure fill:#fff,stroke:#000,stroke-width:2px,stroke-dasharray: 5 5
    style UI fill:#fff,stroke:#000
    style Logic fill:#fff,stroke:#000
    style Native fill:#fff,stroke:#000
```

## Architectural Components

1.  **Presentation Layer**: Built with **React** and **Vite** for maximum performance. **Tailwind CSS** provides a premium UI, while **Recharts** handles the health data visualization.
2.  **Logic Layer**: 
    *   **React Query**: Manages server state, caching, and background data synchronization.
    *   **AI Prediction Engine**: A local analytical module that processes health data to calculate disease risks.
3.  **Infrastructure Layer**: 
    *   **Firebase Authentication**: Handles secure user sessions.
    *   **Cloud Firestore**: A NoSQL database that stores time-series health logs and user profiles.
4.  **Mobile Layer**: **Capacitor.js** acts as a bridge, allowing the web codebase to run natively on **Android**.
