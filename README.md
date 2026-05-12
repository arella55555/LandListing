# Land Listing System

A web/mobile platform for listing and browsing land properties.

## Tech Stack
- React / Expo
- Node.js
- Express
- PostgreSQL
- TypeScript

# Note:
 it will be up to you if you'll follow or make your own folders, change it or what. These are just recommended guide base on the structure. If folders are missing, you may add. If folders are unnecessary, you may remove. 
 Just make sure to remove empty folders if you won't use it.

 PS. This also applies to the 'Roles'
 
# Roles:

Database
backend/src/config/db.ts
database/schema.sql (ex.)
database/seeds.sql (ex.)

Responsibilities:
- PostgreSQL setup
- Database connection
- Tables and relationships
- SQL schema
- Constraints and foreign keys
- Seed/sample data


Hooks
backend/src/routes/
backend/src/controllers/
backend/src/hooks/
backend/src/middleware/

Responsibilities:
- REST API routes
- CRUD logic
- Authentication logic
- JWT verification
- Route protection
- Middleware
- Backend reusable logic


API
backend/src/api/
backend/src/services/
backend/src/app.ts

Responsibilities:
- Third-party API integrations
- Maps/geolocation services
- Image upload services
- Email services
- External API calls
- Service abstraction


Frontend: Home Screen
frontend/src/screens/Home/
frontend/src/components/

Responsibilities:
- Main landing screen after login (buyer view)
- Display featured listings
- Search and filter listings
- Show listing previews/cards
- Navigate to listing details
- Provide responsive UI for browsing
- Entry point for general users (non-admin, non-seller tools)


Frontend: Login & Signup
frontend/src/screens/Auth/
frontend/src/context/
frontend/src/hooks/useAuth.ts
frontend/src/services/authService.ts

Responsibilities:
- Login screen
- Signup screen
- Form validation
- JWT/token storage
- Authentication flow
- Session persistence


Frontend: CRUD
frontend/src/screens/Listings/
frontend/src/hooks/useListings.ts
frontend/src/services/listingService.ts

Responsibilities:
- Create listing
- Edit listing
- Delete listing
- Listing details
- Favorites system
- Fetch listings


Frontend: Dashboard
frontend/src/screens/Dashboard/
frontend/src/navigation/

Responsibilities:
- Admin dashboard
- Role-based navigation
- Dashboard analytics
- Quick actions
maybe:
- Seller and Buyer dashboard

# Professional Note
This project structure serves as a recommended guide for development. Teams may adjust the folder structure as needed depending on implementation requirements.

Developers are allowed to:
- Add folders if necessary
- Modify folder structure for better organization
- Remove unused or empty folders

The goal is to maintain a clean, modular, and maintainable codebase throughout development.