<?php

function admin_token_secret(): string
{
    global $password, $db_name;
    return getenv('ADMIN_TOKEN_SECRET') ?: $password . ':' . $db_name;
}

function base64url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function create_admin_token(array $user): string
{
    $payload = base64url_encode(json_encode([
        'sub' => (int)$user['id'],
        'role' => $user['role'],
        'exp' => time() + 28800
    ]));
    $signature = base64url_encode(hash_hmac('sha256', $payload, admin_token_secret(), true));
    return $payload . '.' . $signature;
}

function require_admin_token(): array
{
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($authorization === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $authorization = $value;
                break;
            }
        }
    }

    if (!preg_match('/^Bearer\s+(\S+)$/i', trim($authorization), $matches)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required.']);
        exit();
    }

    $parts = explode('.', $matches[1]);
    if (count($parts) !== 2) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token.']);
        exit();
    }

    [$payload, $signature] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', $payload, admin_token_secret(), true));
    $decoded = base64_decode(strtr($payload, '-_', '+/'));
    $claims = $decoded === false ? null : json_decode($decoded, true);

    if (!hash_equals($expected, $signature) || !is_array($claims) ||
        empty($claims['sub']) || empty($claims['exp']) || $claims['exp'] <= time()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token.']);
        exit();
    }

    return $claims;
}