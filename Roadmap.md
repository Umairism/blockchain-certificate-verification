## 📍 Roadmap & Milestones

### Phase 1 – Project Setup (Week 1)
- Initialize Flask backend and React frontend projects
- Establish project structure
- Write initial documentation (`README.md`, `requirements.txt`)

### Phase 2 – Blockchain Core (Weeks 2–3)
- Develop Python blockchain (Block & Blockchain classes)
- Store certificate data: ID, student name, degree, issued date
- Implement block hashing and linking

### Phase 3 – API Development (Week 4)
- Create Flask API endpoints:
  - `POST /add_certificate` – Add new certificate (creates new block)
  - `GET /verify/<certificate_id>` – Verify certificate authenticity

### Phase 4 – Frontend Development (Weeks 5–6)
- Build admin panel: Form to add certificates
- Build public panel: Search certificate ID, display verification result
- Integrate QR code scanner for verification

### Phase 5 – Integration & Testing (Week 7)
- Connect React frontend with Flask backend
- Test blockchain tampering prevention
- Conduct end-to-end testing and bug fixes

### Phase 6 – Final Touches & Deployment (Week 8)
- Finalize documentation, styling, and polish UI/UX
- Deploy backend (Flask) on Heroku
- Deploy frontend (React) on Netlify
- Ensure deployment meets FYP requirements