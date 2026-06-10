# Klika backend · imagen PHP-FPM para producción (Unraid/Docker)
FROM php:8.3-fpm-alpine

# Dependencias de sistema + extensiones PHP (pdo_mysql, gd para PDFs, zip, bcmath…)
RUN apk add --no-cache \
        libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev oniguruma-dev icu-dev \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql mbstring bcmath gd zip exif pcntl intl \
    && apk del .build-deps

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Instala dependencias primero (mejor cacheo de capas)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

# Copia el resto del código y finaliza la instalación
COPY . .
RUN composer dump-autoload --optimize --no-dev \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
