# Premium News Features - Configuration & Testing Guide

## 📋 Files Created

### Backend API Endpoints
```
functions/api/newsletter/
├── subscribe.js       # Newsletter subscription with double opt-in
├── confirm.js         # Email confirmation handler
├── unsubscribe.js     # Unsubscribe handler
└── send.js            # Automated newsletter sending (cron)

functions/api/push/
├── subscribe.js       # Push subscription handler
├── unsubscribe.js     # Push unsubscribe handler
└── send.js            # Automated push sending (cron)

functions/api/map/
└── trends.js          # Country-based news trends
```

### Frontend Files
```
sw.js                          # Service Worker for push notifications
js/newsletter.js               # Newsletter UI controller
js/push.js                     # Push notifications UI controller
js/map.js                      # World map UI controller
css/premium-features.css       # Styles for all premium features
noticias.html                  # Updated with 3 new sections
```

### Database
```
migrations/premium_features.sql    # SQL migration file
```

---

## 🔧 Environment Variables

Add these to **Cloudflare Pages Settings → Environment Variables**:

```bash
# Supabase (already configured)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Newsletter
NEWSLETTER_SIGNING_SECRET=<generate-random-secret>
# Example: openssl rand -base64 32

# Push Notifications (VAPID Keys)
VAPID_PUBLIC_KEY=<generate-with-web-push>
VAPID_PRIVATE_KEY=<generate-with-web-push>
VAPID_SUBJECT=mailto:radiomegustacl@gmail.com

# GNews API (for map)
GNEWS_API_KEY=your-gnews-api-key
```

---

## 🔑 Generate VAPID Keys

Run this in your terminal:

```bash
npx web-push generate-vapid-keys
```

Copy the output and add to environment variables.

Then, update `noticias.html` line 172:

```html
<input type="hidden" id="vapid-public-key" value="YOUR_VAPID_PUBLIC_KEY_HERE">
```

---

## 🗄️ Database Setup

1. Go to Supabase SQL Editor
2. Run the migration file: `migrations/premium_features.sql`
3. Verify tables were created:
   - `newsletter_subscribers`
   - `newsletter_logs`
   - `push_subscriptions`

---

## ⏰ Cron Triggers (Cloudflare Workers)

Add to `wrangler.toml`:

```toml
[triggers]
crons = [
  "0 12 * * *",      # Daily newsletter (09:00 Chile = 12:00 UTC)
  "0 12 * * 1",      # Weekly newsletter (Monday 09:00 Chile)
  "*/30 * * * *"     # Push notifications (every 30 min)
]
```

**Manual Testing Endpoints:**

```bash
# Test daily newsletter
curl -X POST https://play.radiomegusta.cl/api/newsletter/send?frequency=daily

# Test weekly newsletter
curl -X POST https://play.radiomegusta.cl/api/newsletter/send?frequency=weekly

# Test push notifications
curl -X POST https://play.radiomegusta.cl/api/push/send
```

---

## 🧪 Testing Guide

### 1. Newsletter Subscription

**Steps:**
1. Go to `/noticias.html`
2. Scroll to "Suscríbete al Newsletter" section
3. Fill in:
   - Email: your-email@example.com
   - Frequency: Weekly
   - Topics: Check "Mundo" and "Chile"
   - Consent: Check the box
4. Click "Suscribirme"
5. **Expected:** Success message "Revisa tu correo para confirmar tu suscripción"
6. Check your email inbox
7. Click the confirmation link
8. **Expected:** Confirmation page "¡Suscripción Confirmada!"
9. Verify in Supabase: `newsletter_subscribers` table should have your email with `active=true`

**Test Unsubscribe:**
1. Trigger a manual newsletter send (see cron testing above)
2. Check your email
3. Click "Darse de baja" at the bottom
4. **Expected:** Unsubscribe confirmation page
5. Verify in Supabase: `active=false`

---

### 2. Push Notifications

**Steps:**
1. Go to `/noticias.html`
2. Scroll to "Notificaciones Push" section
3. Select topics (e.g., "Mundo", "Chile")
4. Click "Activar Notificaciones"
5. **Expected:** Browser permission prompt
6. Click "Allow"
7. **Expected:** Alert "¡Notificaciones activadas exitosamente!"
8. Status should show "Activas"
9. Verify in Supabase: `push_subscriptions` table should have your subscription

**Test Push Delivery:**
1. Trigger manual push send:
   ```bash
   curl -X POST https://play.radiomegusta.cl/api/push/send
   ```
2. **Expected:** Browser notification appears with news headline
3. Click notification
4. **Expected:** Opens `/noticias.html`

**Test Unsubscribe:**
1. Click "Desactivar Notificaciones"
2. **Expected:** Alert "Notificaciones desactivadas"
3. Status should show "Desactivadas"

---

### 3. Interactive World Map

**Steps:**
1. Go to `/noticias.html`
2. Scroll to "Mapa Mundial de Noticias" section
3. **Expected:** Interactive map loads with country markers
4. Hover over a country (e.g., Chile)
5. **Expected:** Tooltip appears with top 5 news headlines
6. Click on a country
7. **Expected:** Alert showing country name (integration with main grid pending)
8. Click topic buttons (Mundo, Tecnología, etc.)
9. **Expected:** Topic selection changes (affects future hover tooltips)

**Test Keyboard Navigation:**
1. Tab to map
2. Use arrow keys to navigate
3. **Expected:** Map pans with keyboard

---

## 📊 Monitoring

### Check Newsletter Logs

```sql
SELECT * FROM newsletter_logs 
ORDER BY sent_at DESC 
LIMIT 10;
```

### Check Push Subscriptions

```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE active = true) as active
FROM push_subscriptions;
```

### Check Newsletter Subscribers

```sql
SELECT 
  frequency,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE active = true) as active
FROM newsletter_subscribers
GROUP BY frequency;
```

---

## 🚀 Deployment Checklist

- [ ] Run SQL migration in Supabase
- [ ] Add all environment variables to Cloudflare Pages
- [ ] Update VAPID public key in `noticias.html`
- [ ] Add cron triggers to `wrangler.toml`
- [ ] Deploy to Cloudflare Pages
- [ ] Test newsletter subscription flow
- [ ] Test push notification flow
- [ ] Test world map functionality
- [ ] Verify cron jobs are running (check Cloudflare dashboard)

---

## 🔍 Troubleshooting

**Newsletter emails not sending:**
- Check MailChannels is working (Cloudflare Pages default)
- Verify `EMAIL_FROM` domain is allowed
- Check `newsletter_logs` table for errors

**Push notifications not working:**
- Verify VAPID keys are correct
- Check browser console for errors
- Ensure HTTPS (required for Service Workers)
- Verify Service Worker is registered: DevTools → Application → Service Workers

**Map not loading:**
- Check browser console for Leaflet.js errors
- Verify GNews API key is valid
- Check network tab for API call failures

---

## 📝 Notes

- **MailChannels**: Free tier on Cloudflare Pages, no API key needed
- **VAPID Keys**: Must be generated and added to environment variables
- **GNews API**: Free tier allows 100 requests/day
- **Cron Jobs**: Only work on Cloudflare Workers, not Pages Functions (may need migration)
- **Service Worker**: Requires HTTPS in production

---

## ✅ Success Criteria

- ✅ Users can subscribe to newsletter with double opt-in
- ✅ Confirmation emails are sent and work
- ✅ Newsletters are sent on schedule (daily/weekly)
- ✅ Users can enable push notifications
- ✅ Push notifications are delivered every 30 minutes
- ✅ World map displays with country markers
- ✅ Hovering shows top 5 news per country
- ✅ All features work on mobile and desktop
