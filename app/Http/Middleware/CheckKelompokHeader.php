<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckKelompokHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->header('X-Kelompok') !== 'kelompok-6') {
            return response()->json([
                'message' => 'Header X-Kelompok tidak valid'
            ], 403);
        }

        return $next($request);
    }
}