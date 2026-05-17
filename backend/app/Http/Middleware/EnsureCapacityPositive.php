<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCapacityPositive
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->has('capacity') && (int)$request->capacity <= 0) {
            return response()->json([
                'message' => 'Capacity harus lebih dari 0'
            ], 422);
        }

        return $next($request);
    }
}