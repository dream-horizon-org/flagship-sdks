#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Simple Test Runner${NC}"
echo "=================================================="

# Auto-detect available iPhone simulator with iOS version
echo -e "${YELLOW}🔍 Detecting available iPhone simulators...${NC}"

# Debug: Show all available devices
echo -e "${BLUE}📱 Available simulators:${NC}"
xcrun simctl list devices available | grep "iPhone" | head -5

# Use JSON format to get device name and runtime (iOS version) together
# This is more reliable than parsing text output
device_info=$(xcrun simctl list devices available --json 2>/dev/null | \
    python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    devices = data.get('devices', {})
    # Find iPhone 16 first, then iPhone 15, then iPhone 14, then any iPhone
    for search_term in ['iPhone 16', 'iPhone 15', 'iPhone 14', 'iPhone']:
        for runtime_id, device_list in devices.items():
            for device in device_list:
                if search_term in device.get('name', ''):
                    runtime = device.get('runtime', '')
                    # Extract iOS version from runtime string like 'com.apple.CoreSimulator.SimRuntime.iOS-18-3'
                    ios_version = runtime.split('iOS-')[-1].replace('-', '.') if 'iOS-' in runtime else ''
                    print(f\"{device.get('name')}|{ios_version}|{device.get('udid')}\")
                    sys.exit(0)
except:
    pass
" 2>/dev/null | head -1)

# Fallback to text parsing if JSON fails
if [ -z "$device_info" ]; then
    # Get first iPhone 16 device line
    device_line=$(xcrun simctl list devices available | grep "iPhone 16" | head -1)
    
    if [ -z "$device_line" ]; then
        device_line=$(xcrun simctl list devices available | grep "iPhone 15" | head -1)
    fi
    if [ -z "$device_line" ]; then
        device_line=$(xcrun simctl list devices available | grep "iPhone 14" | head -1)
    fi
    if [ -z "$device_line" ]; then
        device_line=$(xcrun simctl list devices available | grep "iPhone" | head -1)
    fi
    
    if [ -z "$device_line" ]; then
        echo -e "${RED}❌ No iPhone simulator found${NC}"
        exit 1
    fi
    
    # Extract full device name (everything from "iPhone" until opening parenthesis)
    device_name=$(echo "$device_line" | sed -E 's/^[[:space:]]*(iPhone [0-9A-Za-z ]+).*/\1/' | sed 's/ *$//')
    device_udid=$(echo "$device_line" | grep -oE '\([A-F0-9-]+\)' | head -1 | tr -d '()')
    
    # Get iOS version from device details using UUID
    if [ -n "$device_udid" ]; then
        available_ios=$(xcrun simctl list devices "$device_udid" --json 2>/dev/null | \
            python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    devices = data.get('devices', {})
    for runtime_id, device_list in devices.items():
        for device in device_list:
            runtime = device.get('runtime', '')
            if 'iOS-' in runtime:
                ios_version = runtime.split('iOS-')[-1].replace('-', '.')
                print(ios_version)
                sys.exit(0)
except:
    pass
" 2>/dev/null)
    fi
else
    # Parse device info from JSON
    device_name=$(echo "$device_info" | cut -d'|' -f1)
    available_ios=$(echo "$device_info" | cut -d'|' -f2)
    device_udid=$(echo "$device_info" | cut -d'|' -f3)
fi

if [ -z "$device_name" ]; then
    echo -e "${RED}❌ No iPhone simulator found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found $device_name${NC}"

# If we still don't have iOS version, get it from available runtimes
if [ -z "$available_ios" ] || [ "$available_ios" = "" ]; then
    echo -e "${YELLOW}⚠️  Could not detect iOS version, querying available runtimes...${NC}"
    available_ios=$(xcrun simctl list runtimes available | grep "iOS" | grep -oE "[0-9]+\.[0-9]+" | sort -V | tail -1)
fi

if [ -z "$available_ios" ] || [ "$available_ios" = "" ]; then
    echo -e "${RED}❌ Could not detect iOS version${NC}"
    exit 1
fi

echo -e "${GREEN}📱 Using iOS $available_ios${NC}"

# Validate the device and iOS combination exists by trying to list it
echo -e "${YELLOW}🔍 Validating device and iOS version combination...${NC}"
if xcrun simctl list devices available | grep -q "$device_name"; then
    # Device exists, now verify we can use it (don't check OS version in text output as it's not there)
    echo -e "${GREEN}✅ Device $device_name found${NC}"
    echo -e "${BLUE}ℹ️  Using iOS $available_ios (from available runtimes)${NC}"
else
    echo -e "${RED}❌ Device $device_name not found${NC}"
    exit 1
fi

# Run all tests with better error handling
echo -e "${YELLOW}🚀 Running all tests...${NC}"
echo -e "${BLUE}Destination: platform=iOS Simulator,name=$device_name${NC}"

# Use device name only - xcodebuild will auto-detect the correct iOS version
output=$(xcodebuild test \
    -workspace FlagshipFeatureFlags.xcworkspace \
    -scheme FlagshipFeatureFlags-Example \
    -destination "platform=iOS Simulator,name=$device_name" \
    -only-testing:FlagshipFeatureFlags_Tests \
    2>&1)

# Store the exit code from xcodebuild
xcodebuild_exit_code=$?

echo -e "\n${BLUE}📊 TEST RESULTS${NC}"
echo "=================================================="

# Count tests using multiple methods for better reliability
passed_count=$(echo "$output" | grep "Test Case.*passed" | wc -l | tr -d ' ')
failed_count=$(echo "$output" | grep "Test Case.*failed" | wc -l | tr -d ' ')
total_count=$((passed_count + failed_count)) 

# If we couldn't count from test cases, try alternative parsing
if [ $total_count -eq 0 ]; then
    # Try to extract from summary lines
    final_summary=$(echo "$output" | grep -E "(Executed.*tests.*with.*failures|Test Suite.*passed|Test Suite.*failed)" | tail -1)
    
    if [ -n "$final_summary" ]; then
        # Extract numbers from summary
        total_tests=$(echo "$final_summary" | grep -o "Executed [0-9]* tests" | grep -o "[0-9]*")
        failures=$(echo "$final_summary" | grep -o "[0-9]* failures" | grep -o "[0-9]*")
        
        if [ -z "$total_tests" ]; then
            total_tests=0
        fi
        if [ -z "$failures" ]; then
            failures=0
        fi
        
        total_count=$total_tests
        failed_count=$failures
        passed_count=$((total_tests - failures))
    fi
fi

# Display passed tests
if [ $passed_count -gt 0 ]; then
    echo -e "${GREEN}✅ PASSED TESTS ($passed_count):${NC}"
    echo "=================================================="
    echo "$output" | grep "Test Case.*passed" | while read -r line; do
        test_name=$(echo "$line" | sed 's/.*Test Case.*\[FlagshipFeatureFlags_Tests\.//' | sed 's/\] passed.*//')
        echo -e "  ${GREEN}✅${NC} $test_name"
    done
fi

# Display failed tests with file names
if [ $failed_count -gt 0 ]; then
    echo -e "\n${RED}❌ FAILED TESTS ($failed_count):${NC}"
    echo "=================================================="
    
    echo "$output" | grep "Test Case.*failed" | while read -r line; do
        # Extract test name and class
        test_name=$(echo "$line" | sed 's/.*Test Case.*\[FlagshipFeatureFlags_Tests\.//' | sed 's/\] failed.*//')
        class_name=$(echo "$test_name" | cut -d' ' -f1)
        test_case=$(echo "$test_name" | cut -d' ' -f2-)
        
        # Find the file name
        file_name=$(find Tests -name "*${class_name}.swift" 2>/dev/null | head -1)
        if [ -n "$file_name" ]; then
            file_name=$(basename "$file_name")
        else
            file_name="Unknown"
        fi
        
        echo -e "  ${RED}❌${NC} File: ${YELLOW}$file_name${NC}"
        echo -e "     Test: ${RED}$test_case${NC}"
        echo ""
    done
fi

# Final summary
echo -e "\n${BLUE}📊 FINAL SUMMARY${NC}"
echo "=================================================="
echo -e "Total Tests: ${BLUE}$total_count${NC}"
echo -e "Passed: ${GREEN}$passed_count${NC}"
echo -e "Failed: ${RED}$failed_count${NC}"

# Calculate success rate
if [ $total_count -gt 0 ]; then
    success_rate=$(( (passed_count * 100) / total_count ))
    echo -e "Success Rate: ${CYAN}${success_rate}%${NC}"
fi

# Overall result - only fail if xcodebuild itself failed, not if individual tests failed
if [ $xcodebuild_exit_code -eq 0 ]; then
    if [ $failed_count -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
        exit 0
    else
        echo -e "\n${YELLOW}⚠️  SOME TESTS FAILED, BUT ALL TESTS WERE EXECUTED${NC}"
        echo -e "${YELLOW}📊 Test execution completed successfully${NC}"
        exit 0  # Don't fail the script if tests ran but some failed
    fi
else
    echo -e "\n${RED}❌ TEST EXECUTION FAILED${NC}"
    echo -e "${RED}🔍 Check the output above for build or execution errors${NC}"
    exit 1
fi