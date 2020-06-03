BEGIN;
CREATE TABLE row_counts (
    relationname text PRIMARY KEY,
    relationtuples bigint
);
-- estatblish initial count of all probes
INSERT INTO row_counts (relationname, relationtuples)
VALUES (
        'wifiProbes',
        (
            SELECT count(*)
            from "Wifis"
        )
    );
-- estatblish initial count of null probes
INSERT INTO row_counts (relationname, relationtuples)
VALUES (
        'nullProbes',
        (
            SELECT count(*)
            from "Wifis"
            where "directedProbe" IS NULL
        )
    );
-- estatblish initial count of directed probes
INSERT INTO row_counts (relationname, relationtuples)
VALUES (
        'directedProbes',
        (
            SELECT count(*)
            from "Wifis"
            where "nullProbe" IS NULL
        )
    );
--create trigger function
CREATE OR REPLACE FUNCTION adjust_count() RETURNS TRIGGER AS $$ DECLARE directedProbes VARCHAR;
wifiProbes VARCHAR;
nullProbes VARCHAR;
BEGIN directedProbes = 'directedProbes';
wifiProbes = 'wifiProbes';
nullProbes = 'nullProbes';
IF TG_OP = 'INSERT' THEN IF NEW."directedProbe" IS NOT NULL THEN EXECUTE 'UPDATE row_counts set relationtuples=relationtuples +1 where relationname = ''' || wifiProbes || ''' or relationname = ''' || directedProbes || '''';
ELSE EXECUTE 'UPDATE row_counts set relationtuples=relationtuples +1 where relationname = ''' || wifiProbes || ''' or relationname = ''' || nullProbes || '''';
END IF;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN IF OLD."directedProbe" IS NOT NULL THEN EXECUTE 'UPDATE row_counts set relationtuples=relationtuples -1 where relationname = ''' || wifiProbes || ''' or relationname = ''' || directedProbes || '''';
ELSE EXECUTE 'UPDATE row_counts set relationtuples=relationtuples -1 where relationname = ''' || wifiProbes || ''' or relationname = ''' || nullProbes || '''';
END IF;
RETURN OLD;
END IF;
END;
$$ LANGUAGE 'plpgsql';
--create trigger
CREATE TRIGGER probes_count BEFORE
INSERT
    OR DELETE ON "Wifis" FOR EACH ROW EXECUTE PROCEDURE adjust_count();
COMMIT;