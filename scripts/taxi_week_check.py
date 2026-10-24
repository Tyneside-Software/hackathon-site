"""Print WEEK-OK for seven worked days, and DAY-OK for the one day."""

import sys

import taxi_day_check
import taxi_game


def main():
    if taxi_day_check.main() != 0:
        return 1
    rows = taxi_game.worked_week()
    if taxi_game.sum_pence(rows) != -7840:
        print(f"week sum {taxi_game.sum_pence(rows)}", file=sys.stderr)
        return 1
    if len(rows) != 28:
        print(f"week has {len(rows)} lines", file=sys.stderr)
        return 1
    if any(row["kind"] == "new_car" for row in rows):
        print("the second car was bought in this week", file=sys.stderr)
        return 1
    if taxi_day_check.has_device_id(rows):
        print("a week row has a device_id", file=sys.stderr)
        return 1
    days = {row["game_day"] for row in rows}
    if days != {1, 2, 3, 4, 5, 6, 7}:
        print(f"week days {days}", file=sys.stderr)
        return 1
    print("WEEK-OK")
    fleet = taxi_game.fleet_week()
    if taxi_game.sum_pence(fleet) != -807840:
        print(f"fleet sum {taxi_game.sum_pence(fleet)}", file=sys.stderr)
        return 1
    purchases = [row for row in fleet if row["kind"] == "new_car"]
    if len(purchases) != 1 or purchases[0]["game_day"] != 1 or purchases[0]["amount_pence"] != -800000:
        print(f"fleet purchase {purchases}", file=sys.stderr)
        return 1
    unpaid = taxi_game.unpaid_second_car()
    if unpaid["taxi"]["status"] != "at_depot" or "device_id" in unpaid["taxi"]:
        print("unpaid car left the depot or is a device", file=sys.stderr)
        return 1
    if taxi_game.start_unpaid_car() != []:
        print("unpaid car wrote a fare", file=sys.stderr)
        return 1
    if taxi_day_check.has_device_id(fleet):
        print("a fleet row has a device_id", file=sys.stderr)
        return 1
    print("FLEET-OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
