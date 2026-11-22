% GasRek! - rules (SWI-Prolog 9)
% Times are minutes since midnight (e.g. 15:00 = 900). Convert HH:MM in Python.
% Fare values: data/raw/fares.md (retrieved 21 Nov 2026).

% R1: fare of one ticket, by passenger type.
% fares.md gives the same fare for Suroboyo Bus, Wira Wiri Suroboyo and
% Trans Semanggi Suroboyo, so the operator is not a parameter.

fare_by_type(general, 5000).
fare_by_type(student, 2500).

% R3: Passsangers that pay Rp. 0,00

fare_by_type(elderly,  0).
fare_by_type(child,    0).
fare_by_type(disabled, 0).
fare_by_type(veteran,  0).

% R2: one ticket is valid for 2 hours. Boarding another bus within that time
% costs nothing extra; boarding later needs a new ticket (a new 2-hour window).

ticket_validity_min(120).

% trip_fare(+PassengerType, +BoardTimes, -Fare)
% BoardTimes: boarding time of each leg, in order, in minutes since midnight.

trip_fare(Type, BoardTimes, Fare) :-
    fare_by_type(Type, Base),
    ticket_validity_min(Validity),
    count_tickets(BoardTimes, Validity, Tickets),
    Fare is Base * Tickets.

% count_tickets(+BoardTimes, +Validity, -Tickets)
% A ticket bought at the first boarding covers every leg boarded before
% T0 + Validity; the next uncovered leg starts a new ticket.

count_tickets([], _, 0).
count_tickets([T0|Rest], Validity, Tickets) :-
    Limit is T0 + Validity,
    drop_covered(Rest, Limit, Remaining),
    count_tickets(Remaining, Validity, Tickets0),
    Tickets is Tickets0 + 1.

drop_covered([T|Ts], Limit, Rest) :-
    T < Limit, !,
    drop_covered(Ts, Limit, Rest).
drop_covered(Rest, _, Rest).