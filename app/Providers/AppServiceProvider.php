<?php

namespace App\Providers;

use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityRequirement;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Scramble::afterOpenApiGenerated(function (OpenApi $openApi) {
            $openApi->components->securitySchemes['kelompok-header'] = SecurityScheme::apiKey('header', 'X-Kelompok');
            $openApi->components->securitySchemes['category-header'] = SecurityScheme::apiKey('header', 'X-Category-Access');

            $openApi->security[] = new SecurityRequirement(['kelompok-header' => []]);
            $openApi->security[] = new SecurityRequirement(['category-header' => []]);
        });
    }
}
