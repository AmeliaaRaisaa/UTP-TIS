<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckKelompokHeader
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // cek header X-Kelompok
        if ($request->header('X-Kelompok') !== 'kampus') {
            return response()->json([
                'message' => 'Header tidak valid'
            ], 403);
        }

        return $next($request);
    }
}