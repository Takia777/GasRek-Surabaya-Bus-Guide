# Frontend

Owner: Fathiya. Task sheet: [`docs/tasks/fathiya.md`](../docs/tasks/fathiya.md).

Web interface of GasRek!, built with React (Vite) and Leaflet. Works on phone and laptop screens; the interface is in Indonesian.

## Screens

1. **Search form:** origin and destination with stop suggestions, departure time, passenger type, filter (all, fastest, cheapest).
2. **Results:** one card per route with departure, arrival, duration, transfers and fare.
3. **Route detail:** step-by-step trip, stops passed, total distance, route on a map.
4. **Messages:** "routes ended" and "no route", with the alternative stop.
5. **Chat panel:** conversation with the chatbot, linking to route details.

Until the backend is ready, use mock data that follows [`docs/api-contract.md`](../docs/api-contract.md).

## Status

All five screens work with mock data and follow the Stitch design (phone and laptop). Not connected to the backend yet (Phase 4, integration).

## Run

    cd frontend
    npm install
    npm run dev

## Mock data or backend

The switch is `USE_MOCK` in `src/api.js`.

- `true`: uses `src/mock/`, no server needed.
- `false`: calls the backend at `VITE_API_URL` (default `http://localhost:8000`).

Mock behaviour: destination `STP0999` returns `no_route`; a departure time of 21:00 or later returns `ended_today` with an alternative stop; anything else returns `ok` with two routes.

## Structure

    src/
      api.js          API calls (searchStops, searchRoutes, sendChat)
      format.js       rupiah, km and transfer formatting
      mock/           mock data and mock API
      components/     SearchForm, StopInput, RouteList, RouteDetail,
                      RouteMap, SpecialMessage, ChatPanel
      styles/         one CSS file per component

## Open points

- How the chat sends back a stop the user picked (now it sends the stop name as a message).
- `alternative_stop` has no distance in the contract, so no distance is shown.