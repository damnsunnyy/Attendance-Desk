UPDATE leave_periods SET status='CLOSED' WHERE ends_on < CURRENT_DATE AND status='OPEN';
DO $$
DECLARE cycle_year INT;
BEGIN
  cycle_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  IF CURRENT_DATE > make_date(cycle_year, 7, 31) THEN
    cycle_year := cycle_year + 1;
  END IF;
  INSERT INTO leave_periods(name, starts_on, ends_on, status)
  VALUES ('PM Core ' || cycle_year || ' · Jan–Jul', make_date(cycle_year,1,1), make_date(cycle_year,7,31), 'OPEN')
  ON CONFLICT(starts_on,ends_on) DO NOTHING;
END $$;
