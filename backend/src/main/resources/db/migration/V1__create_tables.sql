CREATE TABLE roles (
                       id BIGINT NOT NULL AUTO_INCREMENT,
                       name VARCHAR(50) NOT NULL,
                       description VARCHAR(255) NULL,
                       PRIMARY KEY (id),
                       CONSTRAINT uk_roles_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE users (
                       id BIGINT NOT NULL AUTO_INCREMENT,
                       role_id BIGINT NOT NULL,
                       email VARCHAR(255) NULL,
                       password_hash VARCHAR(255) NULL,
                       email_verified BOOLEAN NOT NULL DEFAULT FALSE,
                       display_name VARCHAR(100) NOT NULL,
                       phone VARCHAR(20) NULL,
                       avatar_url VARCHAR(500) NULL,
                       account_status VARCHAR(20) NOT NULL,
                       anonymized_at DATETIME(3) NULL,
                       created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                       updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                       PRIMARY KEY (id),
                       CONSTRAINT uk_users_email UNIQUE (email),
                       CONSTRAINT chk_users_account_status
                           CHECK (account_status IN ('ACTIVE', 'LOCKED', 'DISABLED', 'ANONYMIZED')),
                       CONSTRAINT fk_users_role
                           FOREIGN KEY (role_id) REFERENCES roles (id)
                               ON UPDATE RESTRICT ON DELETE RESTRICT,
                       INDEX idx_users_role_id (role_id)
) ENGINE=InnoDB;

CREATE TABLE user_identities (
                                 id BIGINT NOT NULL AUTO_INCREMENT,
                                 user_id BIGINT NOT NULL,
                                 provider VARCHAR(30) NOT NULL,
                                 provider_user_id VARCHAR(255) NOT NULL,
                                 provider_email VARCHAR(255) NULL,
                                 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                 PRIMARY KEY (id),
                                 CONSTRAINT uk_user_identities_provider_subject UNIQUE (provider, provider_user_id),
                                 CONSTRAINT chk_user_identities_provider
                                     CHECK (provider IN ('GOOGLE', 'FACEBOOK')),
                                 CONSTRAINT fk_user_identities_user
                                     FOREIGN KEY (user_id) REFERENCES users (id)
                                         ON UPDATE RESTRICT ON DELETE RESTRICT,
                                 INDEX idx_user_identities_user_id (user_id)
) ENGINE=InnoDB;

CREATE TABLE membership_requests (
                                     id BIGINT NOT NULL AUTO_INCREMENT,
                                     user_id BIGINT NOT NULL,
                                     status VARCHAR(20) NOT NULL,
                                     message VARCHAR(1000) NULL,
                                     reviewed_by BIGINT NULL,
                                     reviewed_at DATETIME(3) NULL,
                                     rejection_reason VARCHAR(500) NULL,
                                     created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                     pending_user_id BIGINT GENERATED ALWAYS AS
                                         (CASE WHEN status = 'PENDING' THEN user_id ELSE NULL END) STORED,
                                     PRIMARY KEY (id),
                                     CONSTRAINT chk_membership_requests_status
                                         CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
                                     CONSTRAINT fk_membership_requests_user
                                         FOREIGN KEY (user_id) REFERENCES users (id)
                                             ON UPDATE RESTRICT ON DELETE RESTRICT,
                                     CONSTRAINT fk_membership_requests_reviewer
                                         FOREIGN KEY (reviewed_by) REFERENCES users (id)
                                             ON UPDATE RESTRICT ON DELETE RESTRICT,
                                     CONSTRAINT uk_membership_requests_one_pending UNIQUE (pending_user_id),
                                     INDEX idx_membership_requests_user_status_created (user_id, status, created_at),
                                     INDEX idx_membership_requests_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE memberships (
                             id BIGINT NOT NULL AUTO_INCREMENT,
                             user_id BIGINT NOT NULL,
                             status VARCHAR(20) NOT NULL,
                             joined_at DATETIME(3) NOT NULL,
                             left_at DATETIME(3) NULL,
                             approved_by BIGINT NULL,
                             created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                             active_user_id BIGINT GENERATED ALWAYS AS
                                 (CASE WHEN status = 'ACTIVE' THEN user_id ELSE NULL END) STORED,
                             PRIMARY KEY (id),
                             CONSTRAINT chk_memberships_status CHECK (status IN ('ACTIVE', 'LEFT')),
                             CONSTRAINT chk_memberships_left_at
                                 CHECK (
                                     (status = 'ACTIVE' AND left_at IS NULL)
                                         OR (status = 'LEFT' AND left_at IS NOT NULL)
                                     ),
                             CONSTRAINT fk_memberships_user
                                 FOREIGN KEY (user_id) REFERENCES users (id)
                                     ON UPDATE RESTRICT ON DELETE RESTRICT,
                             CONSTRAINT fk_memberships_approver
                                 FOREIGN KEY (approved_by) REFERENCES users (id)
                                     ON UPDATE RESTRICT ON DELETE RESTRICT,
                             CONSTRAINT uk_memberships_one_active UNIQUE (active_user_id),
                             INDEX idx_memberships_user_status (user_id, status),
                             INDEX idx_memberships_status_joined (status, joined_at)
) ENGINE=InnoDB;

CREATE TABLE contribution_campaigns (
                                        id BIGINT NOT NULL AUTO_INCREMENT,
                                        created_by BIGINT NOT NULL,
                                        name VARCHAR(150) NOT NULL,
                                        description TEXT NULL,
                                        campaign_type VARCHAR(30) NOT NULL,
                                        period_month TINYINT UNSIGNED NULL,
                                        period_year SMALLINT UNSIGNED NULL,
                                        status VARCHAR(20) NOT NULL,
                                        start_at DATETIME(3) NOT NULL,
                                        end_at DATETIME(3) NULL,
                                        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                                        generated_period_year SMALLINT UNSIGNED GENERATED ALWAYS AS
        (CASE WHEN campaign_type = 'MONTHLY' THEN period_year ELSE NULL END) STORED,
                                        generated_period_month TINYINT UNSIGNED GENERATED ALWAYS AS
        (CASE WHEN campaign_type = 'MONTHLY' THEN period_month ELSE NULL END) STORED,
                                        PRIMARY KEY (id),
                                        CONSTRAINT chk_campaigns_type CHECK (campaign_type IN ('MONTHLY', 'SUPPLEMENTARY')),
                                        CONSTRAINT chk_campaigns_status
                                            CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED')),
                                        CONSTRAINT chk_campaigns_period
                                            CHECK (
                                                (campaign_type = 'MONTHLY'
                                                    AND period_month IS NOT NULL AND period_month BETWEEN 1 AND 12
                                                    AND period_year IS NOT NULL AND period_year > 0)
                                                    OR
                                                (campaign_type = 'SUPPLEMENTARY'
                                                    AND period_month IS NULL AND period_year IS NULL)
                                                ),
                                        CONSTRAINT chk_campaigns_time
                                            CHECK (end_at IS NULL OR end_at >= start_at),
                                        CONSTRAINT fk_campaigns_creator
                                            FOREIGN KEY (created_by) REFERENCES users (id)
                                                ON UPDATE RESTRICT ON DELETE RESTRICT,
                                        CONSTRAINT uk_campaigns_monthly_period
                                            UNIQUE (generated_period_year, generated_period_month),
                                        INDEX idx_campaigns_status_start (status, start_at)
) ENGINE=InnoDB;

CREATE TABLE contributions (
                               id BIGINT NOT NULL AUTO_INCREMENT,
                               campaign_id BIGINT NULL,
                               contributor_id BIGINT NULL,
                               created_by BIGINT NOT NULL,
                               contribution_type VARCHAR(30) NOT NULL,
                               amount BIGINT NOT NULL,
                               status VARCHAR(20) NOT NULL,
                               note VARCHAR(500) NULL,
                               cancellation_reason VARCHAR(500) NULL,
                               created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               confirmed_at DATETIME(3) NULL,
                               PRIMARY KEY (id),
                               CONSTRAINT chk_contributions_type
                                   CHECK (contribution_type IN ('NORMAL', 'OPENING_BALANCE')),
                               CONSTRAINT chk_contributions_status
                                   CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
                               CONSTRAINT chk_contributions_amount
                                   CHECK (
                                       amount > 0
                                           AND (contribution_type <> 'NORMAL' OR amount >= 10000)
                                       ),
                               CONSTRAINT chk_contributions_type_references
                                   CHECK (
                                       (contribution_type = 'NORMAL'
                                           AND campaign_id IS NOT NULL AND contributor_id IS NOT NULL)
                                           OR
                                       (contribution_type = 'OPENING_BALANCE'
                                           AND campaign_id IS NULL AND contributor_id IS NULL)
                                       ),
                               CONSTRAINT fk_contributions_campaign
                                   FOREIGN KEY (campaign_id) REFERENCES contribution_campaigns (id)
                                       ON UPDATE RESTRICT ON DELETE RESTRICT,
                               CONSTRAINT fk_contributions_contributor
                                   FOREIGN KEY (contributor_id) REFERENCES users (id)
                                       ON UPDATE RESTRICT ON DELETE RESTRICT,
                               CONSTRAINT fk_contributions_creator
                                   FOREIGN KEY (created_by) REFERENCES users (id)
                                       ON UPDATE RESTRICT ON DELETE RESTRICT,
                               INDEX idx_contributions_campaign_status_created (campaign_id, status, created_at),
                               INDEX idx_contributions_contributor_created (contributor_id, created_at),
                               INDEX idx_contributions_type_status_created (contribution_type, status, created_at)
) ENGINE=InnoDB;

CREATE TABLE payments (
                          id BIGINT NOT NULL AUTO_INCREMENT,
                          contribution_id BIGINT NOT NULL,
                          confirmed_by BIGINT NULL,
                          amount BIGINT NOT NULL,
                          payment_method VARCHAR(30) NOT NULL,
                          status VARCHAR(20) NOT NULL,
                          provider VARCHAR(50) NULL,
                          payment_reference VARCHAR(100) NOT NULL,
                          provider_transaction_id VARCHAR(150) NULL,
                          paid_at DATETIME(3) NULL,
                          confirmed_at DATETIME(3) NULL,
                          created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                          pending_contribution_id BIGINT GENERATED ALWAYS AS
                              (CASE WHEN status = 'PENDING' THEN contribution_id ELSE NULL END) STORED,
                          succeeded_contribution_id BIGINT GENERATED ALWAYS AS
                              (CASE WHEN status = 'SUCCEEDED' THEN contribution_id ELSE NULL END) STORED,
                          PRIMARY KEY (id),
                          CONSTRAINT uk_payments_reference UNIQUE (payment_reference),
                          CONSTRAINT uk_payments_provider_transaction UNIQUE (provider_transaction_id),
                          CONSTRAINT chk_payments_amount CHECK (amount > 0),
                          CONSTRAINT chk_payments_method CHECK (payment_method IN ('CASH', 'ONLINE_GATEWAY')),
                          CONSTRAINT chk_payments_status
                              CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED')),
                          CONSTRAINT uk_payments_one_pending UNIQUE (pending_contribution_id),
                          CONSTRAINT uk_payments_one_succeeded UNIQUE (succeeded_contribution_id),
                          CONSTRAINT fk_payments_contribution
                              FOREIGN KEY (contribution_id) REFERENCES contributions (id)
                                  ON UPDATE RESTRICT ON DELETE RESTRICT,
                          CONSTRAINT fk_payments_confirmer
                              FOREIGN KEY (confirmed_by) REFERENCES users (id)
                                  ON UPDATE RESTRICT ON DELETE RESTRICT,
                          INDEX idx_payments_contribution_created (contribution_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE expenses (
                          id BIGINT NOT NULL AUTO_INCREMENT,
                          paid_by BIGINT NOT NULL,
                          created_by BIGINT NOT NULL,
                          name VARCHAR(150) NOT NULL,
                          description TEXT NOT NULL,
                          amount BIGINT NOT NULL,
                          expense_date DATE NOT NULL,
                          evidence_storage_key VARCHAR(500) NULL,
                          created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                          updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                          PRIMARY KEY (id),
                          CONSTRAINT chk_expenses_amount CHECK (amount > 0),
                          CONSTRAINT fk_expenses_paid_by
                              FOREIGN KEY (paid_by) REFERENCES users (id)
                                  ON UPDATE RESTRICT ON DELETE RESTRICT,
                          CONSTRAINT fk_expenses_creator
                              FOREIGN KEY (created_by) REFERENCES users (id)
                                  ON UPDATE RESTRICT ON DELETE RESTRICT,
                          INDEX idx_expenses_expense_date (expense_date),
                          INDEX idx_expenses_creator_created (created_by, created_at)
) ENGINE=InnoDB;

CREATE TABLE events (
                        id BIGINT NOT NULL AUTO_INCREMENT,
                        created_by BIGINT NOT NULL,
                        name VARCHAR(150) NOT NULL,
                        description TEXT NULL,
                        location VARCHAR(255) NULL,
                        start_at DATETIME(3) NOT NULL,
                        end_at DATETIME(3) NULL,
                        status VARCHAR(20) NOT NULL,
                        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                        PRIMARY KEY (id),
                        CONSTRAINT chk_events_status
                            CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED')),
                        CONSTRAINT chk_events_time CHECK (end_at IS NULL OR end_at >= start_at),
                        CONSTRAINT fk_events_creator
                            FOREIGN KEY (created_by) REFERENCES users (id)
                                ON UPDATE RESTRICT ON DELETE RESTRICT,
                        INDEX idx_events_status_start (status, start_at)
) ENGINE=InnoDB;

CREATE TABLE matches (
                         id BIGINT NOT NULL AUTO_INCREMENT,
                         event_id BIGINT NOT NULL,
                         opponent VARCHAR(150) NOT NULL,
                         start_at DATETIME(3) NOT NULL,
                         location VARCHAR(255) NULL,
                         home_score SMALLINT UNSIGNED NULL,
                         away_score SMALLINT UNSIGNED NULL,
                         status VARCHAR(20) NOT NULL,
                         created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                         updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                         PRIMARY KEY (id),
                         CONSTRAINT chk_matches_status CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
                         CONSTRAINT fk_matches_event
                             FOREIGN KEY (event_id) REFERENCES events (id)
                                 ON UPDATE RESTRICT ON DELETE RESTRICT,
                         INDEX idx_matches_event_start (event_id, start_at)
) ENGINE=InnoDB;

CREATE TABLE media (
                       id BIGINT NOT NULL AUTO_INCREMENT,
                       uploaded_by BIGINT NOT NULL,
                       event_id BIGINT NULL,
                       match_id BIGINT NULL,
                       media_type VARCHAR(20) NOT NULL,
                       storage_key VARCHAR(500) NOT NULL,
                       thumbnail_storage_key VARCHAR(500) NULL,
                       title VARCHAR(150) NULL,
                       description VARCHAR(1000) NULL,
                       visibility VARCHAR(20) NOT NULL,
                       moderation_status VARCHAR(20) NOT NULL,
                       created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                       updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                       PRIMARY KEY (id),
                       CONSTRAINT chk_media_type CHECK (media_type IN ('IMAGE', 'VIDEO')),
                       CONSTRAINT chk_media_visibility CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
                       CONSTRAINT chk_media_moderation
                           CHECK (moderation_status IN ('VISIBLE', 'HIDDEN', 'DELETED')),
                       CONSTRAINT chk_media_context
                           CHECK (match_id IS NULL OR event_id IS NOT NULL),
                       CONSTRAINT fk_media_uploader
                           FOREIGN KEY (uploaded_by) REFERENCES users (id)
                               ON UPDATE RESTRICT ON DELETE RESTRICT,
                       CONSTRAINT fk_media_event
                           FOREIGN KEY (event_id) REFERENCES events (id)
                               ON UPDATE RESTRICT ON DELETE RESTRICT,
                       CONSTRAINT fk_media_match
                           FOREIGN KEY (match_id) REFERENCES matches (id)
                               ON UPDATE RESTRICT ON DELETE RESTRICT,
                       INDEX idx_media_event_created (event_id, created_at),
                       INDEX idx_media_match_created (match_id, created_at),
                       INDEX idx_media_visibility_moderation_created (visibility, moderation_status, created_at)
) ENGINE=InnoDB;

CREATE TABLE comments (
                          id BIGINT NOT NULL AUTO_INCREMENT,
                          media_id BIGINT NOT NULL,
                          author_id BIGINT NOT NULL,
                          parent_comment_id BIGINT NULL,
                          content VARCHAR(2000) NOT NULL,
                          status VARCHAR(20) NOT NULL,
                          created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                          updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                          deleted_at DATETIME(3) NULL,
                          PRIMARY KEY (id),
                          CONSTRAINT chk_comments_status CHECK (status IN ('VISIBLE', 'HIDDEN', 'DELETED')),
                          CONSTRAINT fk_comments_media
                              FOREIGN KEY (media_id) REFERENCES media (id)
                                  ON UPDATE RESTRICT ON DELETE RESTRICT,
                          CONSTRAINT fk_comments_author
                              FOREIGN KEY (author_id) REFERENCES users (id)
                                  ON UPDATE RESTRICT ON DELETE RESTRICT,
                          CONSTRAINT fk_comments_parent
                              FOREIGN KEY (parent_comment_id) REFERENCES comments (id)
                                  ON UPDATE RESTRICT ON DELETE RESTRICT,
                          INDEX idx_comments_media_parent_created (media_id, parent_comment_id, created_at),
                          INDEX idx_comments_author_created (author_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE notifications (
                               id BIGINT NOT NULL AUTO_INCREMENT,
                               recipient_id BIGINT NOT NULL,
                               type VARCHAR(50) NOT NULL,
                               title VARCHAR(150) NOT NULL,
                               content VARCHAR(1000) NOT NULL,
                               related_resource_type VARCHAR(50) NULL,
                               related_resource_id BIGINT NULL,
                               is_read BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               read_at DATETIME(3) NULL,
                               PRIMARY KEY (id),
                               CONSTRAINT fk_notifications_recipient
                                   FOREIGN KEY (recipient_id) REFERENCES users (id)
                                       ON UPDATE RESTRICT ON DELETE RESTRICT,
                               INDEX idx_notifications_recipient_read_created (recipient_id, is_read, created_at)
) ENGINE=InnoDB;

CREATE TABLE audit_records (
                               id BIGINT NOT NULL AUTO_INCREMENT,
                               actor_id BIGINT NULL,
                               action VARCHAR(50) NOT NULL,
                               target_type VARCHAR(50) NOT NULL,
                               target_id BIGINT NOT NULL,
                               reason VARCHAR(500) NULL,
                               change_summary JSON NULL,
                               occurred_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               PRIMARY KEY (id),
                               CONSTRAINT fk_audit_records_actor
                                   FOREIGN KEY (actor_id) REFERENCES users (id)
                                       ON UPDATE RESTRICT ON DELETE RESTRICT,
                               INDEX idx_audit_records_target_occurred (target_type, target_id, occurred_at),
                               INDEX idx_audit_records_actor_occurred (actor_id, occurred_at)
) ENGINE=InnoDB;