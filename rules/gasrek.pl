% GasRek! - rules (SWI-Prolog 9)
% Source of all fare values: data/raw/fares.md (retrieved 21 Nov 2026).

fare_by_type(general, 5000).
fare_by_type(student, 2500).
fare_by_type(elderly,  0).
fare_by_type(child,    0).
fare_by_type(disabled, 0).
fare_by_type(veteran,  0).

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

bus_departure(First, Last, Headway, Offset, Dep) :-
    Headway > 0,
    N is floor((Last - First) / Headway),
    between(0, N, K),
    Dep is First + K * Headway + Offset.

available_departure(First, Last, Headway, Offset, SearchTime, Dep) :-
    bus_departure(First, Last, Headway, Offset, Dep),
    Dep >= SearchTime.

next_departure(First, Last, Headway, Offset, NotBefore, Dep) :-
    once(available_departure(First, Last, Headway, Offset, NotBefore, Dep)).

transfer_wait(First, Last, Headway, Offset, ArriveTime, Wait, Dep) :-
    next_departure(First, Last, Headway, Offset, ArriveTime, Dep),
    Wait is Dep - ArriveTime.

search_status(0, _, no_route, 'Tidak ada rute untuk tujuan tersebut') :- !.      % R7
search_status(_, 0, ended_today, 'Sisa rute hari ini sudah habis, tunggu besok') :- !.  % R6
search_status(_, _, ok, none).

max_alternative_km(1.0).
alternative_stop(Candidates, Stop) :-
    max_alternative_km(Max),
    findall(D-S, (member(D-S, Candidates), D =< Max), Near),
    (   Near == []
    ->  Stop = none
    ;   keysort(Near, [_-Stop|_])
    ).

filter_routes(_, [], []) :- !.
filter_routes(all, Routes, Routes) :- !.
filter_routes(Filter, Routes, [Best]) :-
    member(Filter, [fastest, cheapest]),
    findall(Key-Route,
            ( member(Route, Routes), route_key(Filter, Route, Key) ),
            Pairs),
    keysort(Pairs, [_-Best|_]).

route_key(fastest,  r(_, Duration, Transfers, _),    [Duration, Transfers]).
route_key(cheapest, r(_, Duration, Transfers, Fare), [Fare, Duration, Transfers]).