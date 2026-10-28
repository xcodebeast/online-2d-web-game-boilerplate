FROM nginx:stable-alpine
COPY dist/apps/client /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
