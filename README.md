# NOTAM Request Generator

A web application for generating AFTN-formatted NOTAM (Notice to Airmen) request messages. This tool helps aviation professionals create properly formatted RQN (Request NOTAM) messages according to ICAO standards.

## Features

- **AFTN Standard Compliance**: Generates messages following ICAO AFTN format specifications
- **Real-time Generation**: Messages are generated as you type
- **Form Validation**: Ensures proper format for ICAO codes and AFTN addresses  
- **Email Integration**: Direct email composition with pre-filled message
- **Clipboard Support**: One-click copy to clipboard
- **Data Persistence**: Automatically saves form data locally
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Docker Ready**: Complete containerization for easy deployment
- **Admin Panel**: Configure default values for all fields at `/admin`

## AFTN Message Format

The application generates RQN messages with the following structure:

```
GG EGGGYNYX
202506171234 EGGWYFYX

RQN1234
(RQN-REQUEST NOTAM
A)EGLL
B)202506171400 C)202506181400
D)ALL NOTAMS REQUESTED
E)Additional remarks if any
)
```

## Usage

To run the application locally using Docker:

```bash
docker-compose up --build
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.
Access the administration panel at [http://localhost:8080/admin](http://localhost:8080/admin) to set default values.
