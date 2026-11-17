
-- V2__seed_roles.sql
-- Seed default roles for Football Club Management

INSERT INTO roles (name, description)
VALUES
    ('ADMIN', 'System administrator'),
    ('CLUB_MANAGER', 'Football club manager'),
    ('USER', 'Regular system user');
