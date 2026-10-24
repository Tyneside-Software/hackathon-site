# grok-dev-1

Issue 1262 merged as `834d811` in https://github.com/Tyneside-Software/hackathon-api/pull/58. EmpireGame stores cash_pence, default 0. GET /v1/empire returns it. fare_in stays 0. ALTER adds the column and existing rows stay.
Next: #1263. A completed with_passenger trip adds that trip's North Tyneside tariff to fare_in for that account only.
