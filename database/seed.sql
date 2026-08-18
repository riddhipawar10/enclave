-- =====================================================
-- ENCLAVE INITIAL DATA
-- =====================================================

-- =====================================================
-- 1. ROLES
-- =====================================================

INSERT INTO roles (name)
VALUES
    ('ADMIN'),
    ('MANAGER'),
    ('TEAM_MEMBER')
ON CONFLICT (name) DO NOTHING;


-- =====================================================
-- 2. PERMISSIONS
-- =====================================================

INSERT INTO permissions (name, description)
VALUES
    ('CREATE_ORGANIZATION', 'Create a new organization'),
    ('UPDATE_ORGANIZATION', 'Update organization details'),
    ('DELETE_ORGANIZATION', 'Delete an organization'),
    ('VIEW_ORGANIZATION', 'View organization details'),

    ('MANAGE_MEMBERS', 'Add, remove, and manage organization members'),
    ('VIEW_MEMBERS', 'View organization members'),

    ('CREATE_PROJECT', 'Create a project'),
    ('UPDATE_PROJECT', 'Update project details'),
    ('DELETE_PROJECT', 'Delete a project'),
    ('VIEW_PROJECT', 'View project details'),

    ('CREATE_TASK', 'Create a task'),
    ('UPDATE_TASK', 'Update a task'),
    ('DELETE_TASK', 'Delete a task'),
    ('ASSIGN_TASK', 'Assign a task to a user'),
    ('VIEW_TASK', 'View task details'),

    ('CREATE_COMMENT', 'Add a comment to a task'),
    ('UPDATE_COMMENT', 'Update a comment to a task'),
    ('DELETE_COMMENT', 'Delete a comment from a task'),

    ('VIEW_ANALYTICS', 'View analytics dashboard'),
    ('VIEW_AUDIT_LOG', 'View organization audit logs')
ON CONFLICT (name) DO NOTHING;


-- =====================================================
-- 3. ADMIN → ALL PERMISSIONS
-- =====================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;


-- =====================================================
-- 4. MANAGER → 17 PERMISSIONS
-- =====================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'UPDATE_ORGANIZATION',
    'VIEW_ORGANIZATION',
    'MANAGE_MEMBERS',
    'VIEW_MEMBERS',

    'CREATE_PROJECT',
    'UPDATE_PROJECT',
    'DELETE_PROJECT',
    'VIEW_PROJECT',

    'CREATE_TASK',
    'UPDATE_TASK',
    'DELETE_TASK',
    'ASSIGN_TASK',
    'VIEW_TASK',

    'CREATE_COMMENT',
    'UPDATE_COMMENT',
    'DELETE_COMMENT',

    'VIEW_ANALYTICS'
)
WHERE r.name = 'MANAGER'
ON CONFLICT DO NOTHING;


-- =====================================================
-- 5. TEAM MEMBER → 9 PERMISSIONS
-- =====================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN (
    'VIEW_ORGANIZATION',
    'VIEW_MEMBERS',
    'VIEW_PROJECT',

    'CREATE_TASK',
    'UPDATE_TASK',
    'VIEW_TASK',

    'CREATE_COMMENT',
    'UPDATE_COMMENT',
    'DELETE_COMMENT'
)
WHERE r.name = 'TEAM_MEMBER'
ON CONFLICT DO NOTHING;


-- =====================================================
-- 6. TASK STATUSES
-- =====================================================

INSERT INTO task_statuses (name, description)
VALUES
    ('TODO', 'Task has not been started'),
    ('IN_PROGRESS', 'Task is currently being worked on'),
    ('REVIEW', 'Task is completed and waiting for review'),
    ('DONE', 'Task has been completed')
ON CONFLICT (name) DO NOTHING;


-- =====================================================
-- 7. TASK PRIORITIES
-- =====================================================

INSERT INTO task_priorities (name, level)
VALUES
    ('LOW', 1),
    ('MEDIUM', 2),
    ('HIGH', 3),
    ('URGENT', 4)
ON CONFLICT (name) DO NOTHING;