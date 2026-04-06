import { Seat } from "../models/seat.models.js";

export const generateSeats = async (showId, totalSeats)=>{
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    let seats = [];
    const seatsPerRow = 19;
    let counter = 0;

    for(let row of rows){
        for(let i=1; i<=seatsPerRow; i++){
            if(counter>totalSeats) break;

            seats.push({
                show: showId,
                seatNumber: `${row}${i}`
            });
            counter++;
        }
        if(counter>totalSeats) break;
    }

    await Seat.insertMany(seats);
}