#!/usr/bin/env python3
"""
Test script a cache rendszer tesztelésére
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

def print_header(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")

def test_cache_endpoints():
    """Teszteli a cache endpoint-okat"""
    
    print_header("CACHE RENDSZER TESZT")
    
    try:
        # 1. Cache info lekérése
        print("\n1. Cache információk lekérése...")
        response = requests.get(f"{BASE_URL}/cache/info")
        if response.status_code == 200:
            cache_info = response.json()
            print("✅ Cache info sikeres")
            print(json.dumps(cache_info, indent=2, ensure_ascii=False))
        else:
            print(f"❌ Cache info hiba: {response.status_code}")
            
        # 2. Vonatok lekérése (cache-el)
        print("\n2. Vonatok lekérése (első hívás - cache feltöltés)...")
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/trains")
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Vonatok lekérése sikeres ({end_time - start_time:.3f}s)")
            print(f"   Vonatok száma: {data.get('count', 0)}")
            print(f"   Cache-ből: {data.get('from_cache', False)}")
            print(f"   Utolsó frissítés: {data.get('last_updated', 'N/A')}")
        else:
            print(f"❌ Vonatok lekérése hiba: {response.status_code}")
            
        # 3. Vonatok újra lekérése (cache-ből)
        print("\n3. Vonatok újra lekérése (cache-ből)...")
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/trains")
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Vonatok újra lekérése sikeres ({end_time - start_time:.3f}s)")
            print(f"   Cache-ből: {data.get('from_cache', False)}")
            print(f"   Utolsó frissítés: {data.get('last_updated', 'N/A')}")
        else:
            print(f"❌ Vonatok újra lekérése hiba: {response.status_code}")
            
        # 4. Rendszer állapot
        print("\n4. Rendszer állapot lekérése...")
        response = requests.get(f"{BASE_URL}/status")
        if response.status_code == 200:
            status = response.json()
            print("✅ Rendszer állapot sikeres")
            print(f"   Összes vonat: {status.get('status', {}).get('total_trains', 0)}")
            print(f"   Utolsó frissítés: {status.get('last_updated', 'N/A')}")
        else:
            print(f"❌ Rendszer állapot hiba: {response.status_code}")
            
        # 5. Keresés teszt
        print("\n5. Keresés teszt...")
        response = requests.get(f"{BASE_URL}/search?q=Budapest")
        if response.status_code == 200:
            search_data = response.json()
            print(f"✅ Keresés sikeres")
            print(f"   Találatok: {search_data.get('count', 0)}")
            print(f"   Utolsó frissítés: {search_data.get('last_updated', 'N/A')}")
        else:
            print(f"❌ Keresés hiba: {response.status_code}")
            
        # 6. Cache frissítés teszt
        print("\n6. Manuális cache frissítés...")
        response = requests.post(f"{BASE_URL}/cache/refresh")
        if response.status_code == 200:
            print("✅ Cache frissítés sikeres")
            refresh_data = response.json()
            print(f"   Üzenet: {refresh_data.get('message', 'N/A')}")
        else:
            print(f"❌ Cache frissítés hiba: {response.status_code}")
            
        # 7. Cache info újra
        print("\n7. Cache információk újra...")
        response = requests.get(f"{BASE_URL}/cache/info")
        if response.status_code == 200:
            cache_info = response.json()
            print("✅ Cache info sikeres")
            for cache_type, info in cache_info.get('cache_info', {}).items():
                exists = "✅" if info.get('exists') else "❌"
                size = info.get('file_size', 0)
                last_update = info.get('last_updated', 'N/A')
                print(f"   {cache_type}: {exists} ({size} bytes) - {last_update}")
        else:
            print(f"❌ Cache info hiba: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Nem sikerült csatlakozni a backend-hez!")
        print("   Ellenőrizd, hogy fut-e a Flask alkalmazás a http://localhost:5000 címen")
    except Exception as e:
        print(f"❌ Hiba történt: {e}")

def test_performance():
    """Teljesítmény teszt cache-el és nélküle"""
    
    print_header("TELJESÍTMÉNY TESZT")
    
    try:
        # Cache törlése
        print("Cache törlése...")
        requests.post(f"{BASE_URL}/cache/clear")
        
        # Első hívás (cache nélkül)
        print("\n1. Első hívás (cache feltöltés)...")
        times = []
        for i in range(3):
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/trains")
            end_time = time.time()
            duration = end_time - start_time
            times.append(duration)
            
            if response.status_code == 200:
                data = response.json()
                cache_status = "cache-ből" if data.get('from_cache') else "frissen"
                print(f"   Hívás {i+1}: {duration:.3f}s ({cache_status})")
            
            time.sleep(1)  # Várunk egy kicsit
            
        avg_time = sum(times) / len(times)
        print(f"\n   Átlagos idő: {avg_time:.3f}s")
        
    except Exception as e:
        print(f"❌ Teljesítmény teszt hiba: {e}")

if __name__ == "__main__":
    print("🚂 Magyar Vonatkövető - Cache Teszt")
    print(f"Teszt ideje: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_cache_endpoints()
    test_performance()
    
    print(f"\n{'='*50}")
    print("  TESZT BEFEJEZVE")
    print(f"{'='*50}")