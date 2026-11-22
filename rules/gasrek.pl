% GasRek! - rules (SWI-Prolog 9)
% Times are minutes since midnight (e.g. 15:00 = 900). Convert HH:MM in Python.
% Fare values: data/raw/fares.md (retrieved 21 Nov 2026).

% R1: fare of one ticket, by passenger type.

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

trip_fare(Type, BoardTimes, Fare) :-
    fare_by_type(Type, Base),
    ticket_validity_min(Validity),
    count_tickets(BoardTimes, Validity, Tickets),
    Fare is Base * Tickets.

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

% R4: departure time of each bus at a stop = first departure + k * headway + travel time to that stop.
bus_departure(First, Last, Headway, Offset, Dep) :-
    Headway > 0,
    N is floor((Last - First) / Headway),
    between(0, N, K),
    Dep is First + K * Headway + Offset.

% R5: buses that already left before the search time are hidden.
available_departure(First, Last, Headway, Offset, SearchTime, Dep) :-
    bus_departure(First, Last, Headway, Offset, Dep),
    Dep >= SearchTime.

next_departure(First, Last, Headway, Offset, NotBefore, Dep) :-
    once(available_departure(First, Last, Headway, Offset, NotBefore, Dep)).

% R12: waiting time at a transfer stop, counted from the schedule of the next bus.
transfer_wait(First, Last, Headway, Offset, ArriveTime, Wait, Dep) :-
    next_departure(First, Last, Headway, Offset, ArriveTime, Dep),
    Wait is Dep - ArriveTime.

% R6 and R7: status and message of a search.
search_status(0, _, no_route, 'Tidak ada rute untuk tujuan tersebut') :- !.      % R7
search_status(_, 0, ended_today, 'Sisa rute hari ini sudah habis, tunggu besok') :- !.  % R6
search_status(_, _, ok, none).

% R8: nearest alternative stop that has a route, within 1 km.
max_alternative_km(1.0).

alternative_stop(Candidates, Stop) :-
    max_alternative_km(Max),
    findall(D-S, (member(D-S, Candidates), D =< Max), Near),
    (   Near == []
    ->  Stop = none
    ;   keysort(Near, [_-Stop|_])
    ).