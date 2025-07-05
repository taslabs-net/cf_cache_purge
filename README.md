# Cloudflare Cache Purge Tool

A simple tool that allows you to purge Cloudflare cache with a single click.

## Features

- Clean, user-friendly interface
- One-click cache purging
- Detailed status logging
- Easy to customize for your own domain

## Deploy to Cloudflare

Click the button below to deploy this tool to your Cloudflare account:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/taslabs-net/cf_cache_purge)

## Setup After Deployment

After deploying, you'll need to:

1. Set your Cloudflare Zone ID and domain name in the environment variables
2. Create a Cloudflare API Token with Cache Purge permissions


## How to Create an API Token

1. Go to your Cloudflare dashboard
2. Navigate to "My Profile" > "API Tokens"
3. Click "Create Token"
4. Select the "Create Custom Token" option
5. Give it a name like "Cache Purge Token"
6. Under "Permissions", add:
   - Zone - Cache Purge - Purge
7. Under "Zone Resources", select "Include - Specific zone - Your Domain"
8. Click "Continue to summary" and then "Create Token"
9. Copy the token and use it in your Worker configuration

## Customization

You can customize the appearance and behavior of the cache purge by editing the worker.js file.
