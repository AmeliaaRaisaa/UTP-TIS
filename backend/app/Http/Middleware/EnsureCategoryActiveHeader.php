<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCategoryActiveHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->header('X-Category-Access') !== 'allowed') {
            return response()->json([
                'message' => 'Akses category ditolak. Header X-Category-Access harus bernilai allowed'
            ], 403);
        }

        return $next($request);
    }
}