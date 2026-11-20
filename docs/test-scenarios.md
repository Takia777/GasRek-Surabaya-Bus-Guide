# Test scenarios

Owner: Nashwa. Fill in real stops from `data/processed/` once the data is final, then run every case on the integrated system.

| ID | Scenario | Input (origin → destination, time, passenger, filter) | Expected result | Representation tested | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Q1 | Trip with one transfer | _to fill_ | Route with exactly one transfer at the correct stop | Graph + ontology | | |
| Q2 | Transfer stop between two routes | _to fill_ | Shared stop is listed as a transfer stop, inferred by the reasoner | Ontology | | |
| Q3 | Search at a normal hour | _to fill_, 15:00, all | All remaining routes today, with departure, arrival, duration, fare, stops, distance | Graph + rules | | |
| Q4 | Fastest filter | Same as Q3, fastest | One route, shortest duration | Rules | | |
| Q5 | Cheapest filter | Same as Q3, cheapest | One route, lowest fare | Rules | | |
| Q6 | After the last bus | Same as Q3, 21:30 | "Sisa rute hari ini sudah habis, tunggu besok" + nearest alternative stop | Rules + graph | | |
| Q7 | Destination with no route | _to fill_ | "Tidak ada rute untuk tujuan tersebut" + alternative stop or "tidak ada" | Rules + graph | | |
| Q8 | Chatbot question | "Dari ... ke ... jam 3 sore, saya pelajar" | Same result as Q3 through the form | Chatbot | | |
| Q9 | Ambiguous stop name in chat | "Dari Manyar ke ..." | Chatbot asks which stop is meant | Chatbot | | |
| Q10 | Student vs general fare | Same as Q3 with `general` and `student` | Fares follow the fare rules | Rules | | |

Result values: **pass**, **fail**, or **pass with note**.
