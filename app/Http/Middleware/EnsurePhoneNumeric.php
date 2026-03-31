<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneNumeric
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->has('phone') && !preg_match('/^[0-9]+$/', $request->phone)) {
            return response()->json([
                'message' => 'Nomor telepon harus angka'
            ], 422);
        }

        return $next($request);
    }
}