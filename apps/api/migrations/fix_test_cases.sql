-- Insert test cases for Suma de Dos Números (3fb4957e-6697-4bde-9122-16403a67d7c8)

INSERT INTO test_cases (id, challenge_id, name, input, expected_output, is_sample, points)
VALUES 
-- Sample Case
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '3fb4957e-6697-4bde-9122-16403a67d7c8', 'Sample 1', '2 3', '5', true, 0),

-- Hidden Case 1
('b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', '3fb4957e-6697-4bde-9122-16403a67d7c8', 'Test 1', '10 20', '30', false, 50),

-- Hidden Case 2
('c3d4e5f6-a7b8-4c7d-0e1f-2a3b4c5d6e7f', '3fb4957e-6697-4bde-9122-16403a67d7c8', 'Test 2', '-5 5', '0', false, 50)

ON CONFLICT (id) DO NOTHING;
