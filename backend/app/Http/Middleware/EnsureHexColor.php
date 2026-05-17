<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHexColor
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->has('color') && !preg_match('/^#[A-Fa-f0-9]{6}$/', $request->color)) {
            return response()->json([
                'message' => 'Color harus format hex, contoh: #FF5733'
            ], 422);
        }

        return $next($request);
    }
}
