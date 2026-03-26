# FlipOff — Split-Flap Fullscreen Edition

Diese Version ersetzt die ursprüngliche Startseite durch ein Kiosk-Layout mit einem einzigen schwarzen Split-Flap-Display im Vollbild.

## Funktionen

- 10 neue Zitate pro Tag über die Quotable-API
- Tages-Cache im Browser
- Vollbild per Klick oder Taste `F`
- Split-Flap-Optik mit animierten Ziffern-/Buchstabenwechseln
- Pfeiltasten / Leertaste / Enter für manuelles Durchschalten

## Starten

Öffne `index.html` in einem Browser oder liefere die Dateien über einen beliebigen statischen Webserver aus.

Die API liefert per `GET /quotes/random?limit=10` bis zu 10 zufällige Zitate pro Anfrage. Laut Dokumentation sind bis zu 50 Zitate pro Batch möglich.  
