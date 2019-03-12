all: list parser

list: LinkedList.o liblist.so

LinkedList.o: src/LinkedListAPI.c include/LinkedListAPI.h
	gcc -Wall -std=c11 -c -fpic -Iinclude/../include src/LinkedListAPI.c -o bin/LinkedListAPI.o
	
liblist.so: bin/LinkedListAPI.o
	gcc -shared -o ../liblist.so bin/LinkedListAPI.o

parser: calendarParser.o HelperFunctions.o libcal.so

calendarParser.o: src/CalendarParser.c include/CalendarParser.h
	gcc -Wall -std=c11 -c -fpic -Iinclude/../include src/CalendarParser.c -o bin/CalendarParser.o

HelperFunctions.o: src/HelperFunctions.c include/HelperFunctions.h
	gcc -Wall -std=c11 -c -fpic -Iinclude/../include src/HelperFunctions.c -o bin/HelperFunctions.o

libcal.so:	bin/CalendarParser.o
	gcc -shared -o ../libcal.so bin/CalendarParser.o

clean:
	rm -rf bin/*.o ./*.so
